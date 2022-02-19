// Node.js socket client script
const net = require("net");
// Connect to a server @ port 9898
const client = net.createConnection({ port: 9898 }, () => {
  let payload = {
    message: {
      email: "aj+2@neurosity.co",
      password: "",
    },
    command: "auth",
    action: "login",
  };
  // ,
  // let payload = {
  //   message: {
  //     deviceId: "b8cf91c3a0c89187fd2d5eb61c0d0bc2",
  //   },
  //   command: "notion",
  //   action: "selectDevice",
  // };
  console.log("CLIENT: I connected to the server.");
  let serialized = JSON.stringify(payload) + "\n";
  client.write(serialized);
  console.log("wrote", serialized);
  // payload = {
  //   message: {
  //     gpioEdgeDetectDirection: "both",
  //     gpioPin: 4,
  //   },
  //   command: "gpio",
  //   action: "setup",
  // };
  // serialized = JSON.stringify(payload) + "\n";
  // client.write(serialized);
});
client.on("data", (data) => {
  const payload = JSON.parse(data);
  console.log(payload);
  processMsg(payload);
  console.log(data.toString());
});
client.on("end", () => {
  console.log("CLIENT: I disconnected from the server.");
});

const processMsg = (msg) => {
  if (msg?.command === "auth") {
    if (msg?.action === "login") {
      if (msg?.message?.success) {
        console.log("logged in");
      } else {
        console.log("Failed to login with error", msg?.error);
      }
    }
  }
  if (msg?.command === "websocket") {
    if (msg?.action === "end") {
      client.end();
    }
  }
};
