// Node.js socket server script
// const net = require("net");
// // Create a server object
// const server = net
//   .createServer((socket) => {
//     socket.on("data", (data) => {
//       const payload = JSON.parse(data);
//       console.log(payload);
//       processMsg(payload, socket);
//     });
//     // socket.write("SERVER: Hello! This is server speaking.<br>");
//     // socket.end("SERVER: Closing connection now.<br>");
//   })
//   .on("error", (err) => {
//     console.error(err);
//   });
// // Open server on port 9898
// server.listen(9898, () => {
//   console.log("opened server on", server.address().port);
// });

const http = require("http");
const WebSocketServer = require("websocket").server;
const server = http.createServer();
server.listen(9898);
const wsServer = new WebSocketServer({
  httpServer: server,
});
wsServer.on("request", function (request) {
  const connection = request.accept(null, request.origin);
  connection.on("message", function (message) {
    console.log("Received Message:", message.utf8Data);
    const payload = JSON.parse(message.utf8Data);
    console.log(payload);
    processMsg(payload, connection);
    // connection.sendUTF("Hi this is WebSocket server!");
  });
  connection.on("close", function (reasonCode, description) {
    console.log("Client has disconnected.");
  });
});

const processMsg = async (msg, connection) => {
  let res = {
    ...msg,
    message: { success: false, error: "" },
  };
  if (msg?.command === "auth") {
    if (msg?.action === "login") {
      const output = await login(msg.message);
      if (output.success) {
        res.message.success = true;
      }
    }
  } else if (msg?.command === "gpio") {
    if (msg?.action === "setup") {
      const output = gpioSetup(msg.message);
      if (output.success) {
        res.message.success = true;
      }
    }
  } else if (msg?.command === "websock") {
    if (msg?.action === "end") {
      if (crown) {
        crown.logout();
        crown = null;
      }
    }
  }
  connection.sendUTF(JSON.stringify(res));
};

const { Notion } = require("@neurosity/notion");

let crown = null;

const login = async (creds) => {
  const { email, password } = creds;
  const verification = verifyEnvs(email, password);
  if (verification === null) {
    console.log(email, password);
    crown = new Notion({
      timesync: true,
    });
    await crown
      .login({
        email,
        password,
      })
      .catch((error) => {
        console.log(error);
        throw new Error(error);
      });

    console.log("Logged in");
    crown.getInfo().then(console.log);
    return {
      success: true,
      error: "",
    };
  }
  return {
    success: false,
    error: verification,
  };
};

const verifyEnvs = (email, password) => {
  const invalidEnv = (env) => {
    return env === "" || env === 0;
  };
  if (invalidEnv(email) || invalidEnv(password)) {
    return "Please verify email and password";
  }
  return null;
};

const Gpio = require("onoff").Gpio;

const gpioSetup = (config) => {
  const { gpioEdgeDetectDirection, gpioPin } = config;
  const interrupt = new Gpio(gpioPin, "in", gpioEdgeDetectDirection);
  try {
    interrupt.watch((err, value) => {
      if (err) {
        throw err;
      }
      const marker = `gpio-${gpioEdgeDetectDirection}-${value}`;
      // crown.addMarker(marker);
      console.log("marker", marker);
    });
    return {
      success: true,
      error: "",
    };
  } catch (error) {
    return {
      success: false,
      error: error.msg,
    };
  }
};

process.on("SIGTERM", () => {
  if (crown) {
    crown.logout();
    console.log("Killed crown");
  }
});
