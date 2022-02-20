const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(__dirname + "/build"));
app.get("*", function (request, response) {
  response.sendFile(path.resolve(__dirname, "build/index.html"));
});
app.listen("80");
console.log("working on 80");

const server = require("http").createServer();
const io = require("socket.io")(server, { cors: { origin: "*" } });
io.on("connection", (socket) => {
  console.log("Client has connected.");

  socket.on("event", (data, callback) => {
    const payload = JSON.parse(data);
    console.log("payload", payload);
    const res = processMsg(payload, socket);
    callback(JSON.stringify(res));
  });

  socket.on("disconnect", () => {
    console.log("Client has disconnected.");
  });
});

server.listen(9898);

const processMsg = async (msg, socket) => {
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
  return res;
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
      crown.addMarker(marker);
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
