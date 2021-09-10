// Module connects and then server sends all devices that module has to it. [YES]
// Then when module is done and ready it tells the server that its ready
// Client connects and then server tries to initialize the server with any ready module
// If there are any ready modules, server tells them to send their devices current status
// Any module that sends their devices Client will notice and show the correct statuses
// If any module for somereason didnt send devices status, Client should just show Offline for that modules devices

import mqtt from "mqtt";
import {
  OutputDevice,
  checkTopic,
  Client,
  DeviceType,
  emptySettings,
  ClientInitializePayload,
  Light,
  Module,
  parseJson,
  stringJson,
} from "../types";

const moduleToken1 = "vpfGfzzeVxjZ9nS2";

const devices: Array<OutputDevice> = [
  {
    id: 0,
    name: "Light 1",
    type: DeviceType.OutputDevice,
    config: {
      pinConfig: { pin: 26 },
      moduleToken: moduleToken1,
      validCommands: [0, 1],
      isAnalog: false,
      isSubmodule: false,
      isInverted: false,
    },
    settings: emptySettings(),
  } as Light,
  {
    id: 1,
    name: "Light 2",
    type: DeviceType.OutputDevice,
    config: {
      pinConfig: { pin: 19 },
      moduleToken: moduleToken1,
      validCommands: [0, 1],
      isAnalog: false,
      isSubmodule: false,
      isInverted: false,
    },
    settings: emptySettings(),
  } as Light,
  {
    id: 2,
    name: "Light 3",
    type: DeviceType.OutputDevice,
    config: {
      pinConfig: { pin: 13 },
      moduleToken: moduleToken1,
      validCommands: [0, 1],
      isAnalog: false,
      isSubmodule: false,
      isInverted: false,
    },
    settings: emptySettings(),
  } as Light,
];

const options: mqtt.IClientOptions = {
  host: "211b94aa7734472e8c384db21d25fc6d.s2.eu.hivemq.cloud",
  // host: "192.168.1.115",
  username: "lumenite",
  password: "Lumenite2021",
  keepalive: 15,
  protocol: "mqtts",
  port: 8883,
  will: {
    topic: "server/offline",
    payload: "",
    qos: 0,
    retain: false,
  },
};

const server = mqtt.connect(options);

const modules: Array<Module> = [];
const clients: Array<Client> = [];

server.on("connect", () => {
  server.subscribe("module/connect");
  server.subscribe("module/offline");
  server.subscribe("module/+/initialize-finished");
  server.subscribe("client/connect");
  server.subscribe("client/offline");
  server.subscribe("client/+/initialize-finished");
  server.subscribe("client/+/change-device-settings");
  server.publish("server/connect", "");
  console.log("connected");
});

server.on("message", (topic, message) => {
  console.log(topic + ": " + message.toString());

  if (checkTopic(topic, "client/connect")) {
    let connectedClient: Client = { id: message.toString(), config: { registeredModuleTokens: [moduleToken1] }, isReady: false };
    clientConnect(connectedClient);
  } else if (checkTopic(topic, "module/connect")) {
    let connectedModule: Module = { token: message.toString(), isReady: false };
    moduleConnect(connectedModule);
  } else if (checkTopic(topic, "module/initialize-finished", 1)) {
    let token = topic.split("/")[1];
    moduleInitializeFinished(token);
  } else if (checkTopic(topic, "client/initialize-finished", 1)) {
    let id = topic.split("/")[1];
    clientInitializeFinished(id);
  } else if (checkTopic(topic, "client/change-device-settings", 1)) {
    clientChangeDeviceSettings(parseJson(message.toString()));
  } else if (checkTopic(topic, "client/offline")) {
    let id = message.toString();
    clientOffline(id);
  } else if (checkTopic(topic, "module/offline")) {
    let token = message.toString();
    moduleOffline(token);
  }
});

function clientConnect(connectedClient: Client) {
  clients.push(connectedClient);
  var payload: ClientInitializePayload = { devices, config: connectedClient.config };
  clientSetConnected();
  server.publish(`client/${connectedClient.id}/initialize`, stringJson(payload));
}

function moduleConnect(connectedModule: Module) {
  modules.push(connectedModule);
  clientSetConnected();
  // Fetch from database using token
  server.publish(`module/${connectedModule.token}/initialize-devices`, stringJson(devices));
}

function clientOffline(id: string) {
  let index = clients.findIndex((x) => x.id === id);
  if (index != null) {
    clients.splice(index, 1);
    clientSetConnected();
  }
}

function moduleOffline(token: string) {
  let index = modules.findIndex((x) => x.token === token);
  if (index != null) {
    modules.splice(index, 1);
    clientSetConnected();
  }
}

function clientSetConnected() {
  var t0 = performance.now();
  clients.forEach((x) => {
    var connectedModules = 0;
    var connectedClients = 0;
    x.config.registeredModuleTokens.forEach((y) => {
      modules.forEach((x) => {
        if (x.token === y) {
          connectedModules++;
        }
      });
      clients.forEach((x) => {
        x.config.registeredModuleTokens.forEach((c) => {
          if (c === y) {
            connectedClients++;
          }
        });
      });
      // if (clients.some((z) => z.config.registe redModuleTokens.some((x) => x === y))) {
      //   connectedClients++;
      // }
    });
    server.publish(`client/${x.id}/set-connected`, stringJson([connectedClients, connectedModules]));
  });
  var t1 = performance.now();
  console.log("Took " + (t1 - t0) + "ms");
}

function moduleInitializeFinished(token: string) {
  var module = modules.find((x) => x.token === token);
  if (module) {
    module.isReady = true;
  }
  clients.forEach((x) => {
    x.config.registeredModuleTokens.forEach((y) => {
      if (token === y) {
        initializeClient(x);
      }
    });
  });
}

function clientInitializeFinished(id: string) {
  var client = clients.find((x) => x.id === id);
  if (client) {
    client.isReady = true;
    initializeClient(client);
  }
}

function clientChangeDeviceSettings(device: OutputDevice) {
  var originalDevice = getDevice(device.id);
  originalDevice.settings = device.settings;
  // Verify that settings are valid
  server.publish(`module/${device.config.moduleToken}/change-device-settings`, stringJson(device));
}

function initializeClient(client: Client) {
  if (client.isReady && modules.some((x) => x.isReady)) {
    client.config.registeredModuleTokens.forEach((token) => {
      var module = modules.find((x) => x.token === token);
      if (module) {
        server.publish(`module/${module.token}/get-devices`, client.id);
      }
    });
  }
}

function getDevice(id: number): OutputDevice {
  return devices.find((x) => x.id === id) || devices[0];
}

// const moduleDevices: Array<Device> = parseJson(message);
//   moduleDevices.forEach((value) => {
//     const originalDevice = getDevice(value.id);
//     originalDevice.status.futureStatus = StatusType.None;
//     originalDevice.status.lastStatus = StatusType.None;
//     if (originalDevice.status.currentStatus !== StatusType.Waiting) {
//       originalDevice.status.currentStatus = value.status.currentStatus;
//     }
//   });

// setInterval(() => {
//   const originalDevice = devices[0];
//   Object.freeze(originalDevice);
//   const newDevice = originalDevice;
//   newDevice.status.futureStatus = originalDevice.status.futureStatus === 0 ? 1 : 0;
//   server.publish(`module/${id}/change-device-status`, stringJson(basicDeviceAsDevice(newDevice)));
// }, 1000);

// function moduleDeviceStatusChanged(message: string) {
//   const device: Device = parseJson(message);
//   const originalDevice = getDevice(device.id);
//   // For devices with more than just currentStatus (Like rgb light with 3 other color statuses)
//   originalDevice.status.currentStatus = device.status.currentStatus;
//   Object.assign(originalDevice.status, device.status);
// }
