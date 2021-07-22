import express from "express";
import Http from "http";
import SocketIO from "socket.io";
import historyApi from "connect-history-api-fallback";
import path from "path";
import {
  BasicDevice,
  Client,
  ClientCommands,
  ClientConfiguration,
  Device,
  DeviceStatus,
  DeviceType,
  emptySettings,
  emptyStatus,
  emptyTime,
  getMsFromTime,
  getTimeFromMs,
  Light,
  ManualTimings,
  ManualTimingType,
  Module,
  ModuleCommands,
  RgbLight,
  SocketRooms,
  StatusType,
  Timer,
  TimingType,
} from "../types";
const port = process.env.PORT || 3001;
const app = express();
const http = new Http.Server(app);
const filePath = path.join(__dirname, "../dist/");
const io = new SocketIO.Server(http, {
  cors: {
    origin: "*",
  },
  pingTimeout: 5000,
  pingInterval: 3000,
});

/* Lumenite Flow:
  Client connects:
    - Client sends client:set to identify the connetion is a client
      - Server sends client:cloud-connect to set the cloud connection state to CONNECTED on the client
      - Server sends client:configure to let the client know its time to configure
        - Client sends back client:configure-response to tell the server client is ready to configure
          - Server adds the client as a ready to an array
          - Server sends client:set-connected-count to all connected clients to set the connected clients count (args: length of the clients array)

  Client disconnects:
    - Server removes the client from the array

  Module connects:
    - Module sends module:set to indentify the connection is a module
    - Server sends client:module-connect to set the module connection state to CONNECTED on the client
      - Server sends module:configure to set module device configurations (args: an array of devices containing their pin configuration and id)
        - Module sends module:configure-response to tell the server module is configured and ready
          - Server adds the module as ready to an array

  Module disconnects:
    - Server removes the module from the array
    - Server sends client:module-disconnect to set that module connection state to DISCONNECTED on the client (args: the id of the module that got disconnected)

  atleast 1 Module and 1 Client had their configure-response:
    - Server sends module:get-devices-status to all of the module to get physical pin status from all registered devices and stores it to an array
      - Each Module sends back module:set-devices-status to give the server all devices status (args: an array of all devices status)
        - Server sends client:set-devices to all connected clients to send the clients all devices (args: an array of all devices containing status, id, settings)

  Client changes a device status locally:
    - Client changes that device local status to PROCESSING
    - Client sends client:change-device-status to tell the server a device needs to change its status (args: the device that its status needs to change, and what status it should change to)
      - Server sends module:change-device-status to tell the module which device and what status it needs to change to (args: the device that its status needs to change, and what status it should change to)
        - Module writes that status to the corresponding pin
          - If the data came with a pinCheck the module will also check that pin after the power pin was changed
            - If the pinCheck status is not equal to the power pin status:
              - Module sends module:device-pin-error to tell the server that there is a problem with the device pins

  Module loop:
    - Module will check for any new pin status using oldPin status as a reference
      - If a pin is changed:
        - Module sends module:device-status-changed to tell the server one of the devices status is changed (args: the device with its status in 0-1 or 0-255 format)
          - Server sends client:device-status-changed to set the client device status to the corresponding StatusType (args: the device with its status in OFF or ON or Analog output)
          - Module sets that device oldStatus to this new one

  Client changes a device settings locally:
    - Client sends client:change-device-settings to tell the server a device settings need to change (args: the device that its settings needs to change)
      - Server clarifies that the settings are valid. If so:
        - Server saves the device settings to the database
          - Server sends client:device-settings-changed to confirm that all changes were valid and applied to the database (args: the device tha its settings were changed)
          
  Client change a device status locally that has manual timings settings on it:
    - Client sends client:change-device-status to tell the server a device needs to change its status (args: the device that its status needs to change, and what status it should change to)
      - Server checks if that device has any timings settings applied to it. If so:
        - Server sends client:device-status-changed to tell the server that the device is now in WAITING status (args: the device that its status needs to change, and StatusType of WAITING)
          - If the timing type is Toggle:
            - If there is no cache:
              - Server gets the Toggle timings from the database
                - Server sets a cache for that device Toggle timings
            - Server waits for the amount of toggleDelay
              - After the wait is over:
                - Server sends module:change-device-status to tell the module which device and what status it needs to change to (args: the device that its status needs to change, and what status it should change to)
          - If the timing type is Pulse:
            - If there is no cache:
              - Server gets the Pulse timings from the database
                - Server sets a cache for that device Pulse timings
            - Server wait for the amount of pulseDelay
              - After the wait is over:
                - Server sends module:change-device-status to tell the module which device and what status it needs to change to (args: the device that its status needs to change, and what status it should change to)
                  - Server waits for the amount of pulseTimeout
                    - After the wait is over:
                      - Server sends module:change-device-status to tell the module which device and what status it needs to change to (args: the device that its status needs to change, and what status it should change to)

  Server waiting loop:
    - Server runs an interval with the delay of 1000ms
      - Server sets a timeout with the specified timer delay
        - Each second the interval runs:
          - Server sends client:set-timer to tell the clients that a timer has changed (args: the timer in HH:mm:ss format)
        - When the timer is finished:
          - Server sends client:set-timer to tell the clients that a timer has finished and set to null (args: the timer)

  Client commands:
    - client:set
    - client:cloud-connect
    - client:configure
    - client:configure-response
    - client:set-connected-count
    - client:module-connect
    - client:module-disconnect
    - client:set-devices
    - client:change-device-status
    - client:device-status-changed
    - client:change-device-settings
    - client:device-settings-changed
    - client:set-timer

  Module commands:
    - module:set
    - module:configure
    - module:configure-response
    - module:get-devices-status
    - module:set-devices-status
    - module:change-device-status
    - module:device-status-changed
    - module:device-pin-error
*/

// const fruitsArray: any = [];

// const banana = { isBlendable: true, blabla: 0 };
// fruitsArray.push(banana);

// const arrayBanana = getBanana();

// arrayBanana.isBlendable = false;
// arrayBanana.blabla = 10000000000;

// console.log(fruitsArray[0]);

// function getBanana() {
//   return fruitsArray[0];
// }

//5 12     4 14
const moduleToken1 = "fjqX1cLaviE715jb";
const moduleToken2 = "vpfGfzzeVxjZ9nS2";

const devices: Array<BasicDevice> = [
  {
    id: 0,
    name: "نور کف",
    type: DeviceType.RgbLight,
    configuration: {
      pinConfiguration: { pin: 22, pinCheck: 23, redPin: 4, greenPin: 3, bluePin: 2 },
      moduleToken: moduleToken2,
      isAnalog: false,
      isSubmodule: true,
      isInverted: false,
    },
    status: emptyStatus(DeviceType.RgbLight),
    settings: emptySettings(DeviceType.RgbLight),
    isConnected: false,
  } as RgbLight,
  {
    id: 1,
    name: "نور سقف",
    type: DeviceType.Light,
    configuration: {
      pinConfiguration: { pin: 24 },
      moduleToken: moduleToken2,
      isAnalog: false,
      isSubmodule: true,
      isInverted: true,
    },
    status: emptyStatus(),
    settings: emptySettings(),
    isConnected: false,
  } as Light,
  // {
  //   id: 10,
  //   name: "Temperature Sensor 1",
  //   type: DeviceType.TemperatureSensor,
  //   configuration: { pinConfiguration: { pin: 13 }, moduleToken: moduleToken1, isAnalog: false, isSubmodule: false },
  //   status: emptyStatus(),
  //   settings: emptySettings(),
  //   isConnected: false,
  // } as TemperatureSensor,
];

const ignoredDevices: Array<number> = [];

const clientConfiguration: ClientConfiguration = {
  registeredModuleTokens: [moduleToken1, moduleToken2],
};

const modules: Array<Module> = [];
const clients: Array<Client> = [];

var setTimer: Function;
var count = 0;
var hasDisconnected = false;

io.on("connection", (socket) => {
  socket.on(ClientCommands.Set, () => {
    console.log("Client connect");
    socket.join(SocketRooms.ClientsRoom);

    var connectedClient: Client = { id: socket.id, isReady: false, isConfigured: false };
    clients.push(connectedClient);

    socket.emit(ClientCommands.CloudConnect);
    socket.emit(ClientCommands.Configure, clientConfiguration);

    socket.on(ClientCommands.ConfigureResponse, () => {
      connectedClient.isReady = true;

      io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.SetConnectedCount, clients.length);
      socket.emit(ClientCommands.SetDevices, devices);
      modules.forEach((value) => {
        socket.emit(ClientCommands.ModuleConnect, value);
      });

      initPossibleClients();
    });

    socket.on(ClientCommands.SetDevicesResponse, () => {
      connectedClient.isConfigured = true;
    });

    socket.on(ClientCommands.ChangeDeviceStatus, (basicDevice: BasicDevice, timingMode: TimingType) => {
      var originalDevice: BasicDevice = getDevice(basicDevice.id);

      var manualTiming = getManualTiming(basicDevice);

      var newStatus: DeviceStatus = {
        currentStatus: StatusType.Waiting,
        futureStatus: basicDevice.status.futureStatus,
        lastStatus: basicDevice.status.lastStatus,
      };
      if (originalDevice.configuration.isInverted) {
        newStatus.futureStatus = getInvertedStatus(basicDevice).futureStatus;
        newStatus.lastStatus = getInvertedStatus(basicDevice).lastStatus;
      }

      if (timingMode === TimingType.Toggle && hasTiming(timingMode, manualTiming)) {
        originalDevice.status = newStatus;
        io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.DeviceStatusChanged, basicDeviceAsDevice(originalDevice));
        addTimeout(
          originalDevice.id,
          () => {
            io.sockets.in(SocketRooms.ModulesRoom).emit(ModuleCommands.ChangeDeviceStatus, basicDeviceAsDevice(originalDevice));
          },
          getMsFromTime(getTiming(ManualTimingType.ToggleDelay, manualTiming))
        );
      } else if (timingMode === TimingType.Pulse && hasTiming(timingMode, manualTiming)) {
        originalDevice.status = newStatus;
        io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.DeviceStatusChanged, basicDeviceAsDevice(originalDevice));
        addTimeout(
          originalDevice.id,
          () => {
            ignoredDevices.push(originalDevice.id);
            io.sockets.in(SocketRooms.ModulesRoom).emit(ModuleCommands.ChangeDeviceStatus, basicDeviceAsDevice(originalDevice));
            swapStatus(originalDevice.status);
            io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.DeviceStatusChanged, basicDeviceAsDevice(originalDevice));
            addTimeout(
              originalDevice.id,
              () => {
                var index = ignoredDevices.findIndex((x) => x === originalDevice.id);
                ignoredDevices.splice(index, 1);
                io.sockets.in(SocketRooms.ModulesRoom).emit(ModuleCommands.ChangeDeviceStatus, basicDeviceAsDevice(originalDevice));
              },
              getMsFromTime(getTiming(ManualTimingType.PulseTimeout, manualTiming))
            );
          },
          getMsFromTime(getTiming(ManualTimingType.PulseDelay, manualTiming))
        );
      } else {
        originalDevice.status = basicDevice.status;
        if (originalDevice.configuration.isInverted) {
          originalDevice.status.futureStatus = getInvertedStatus(basicDevice).futureStatus;
          originalDevice.status.lastStatus = getInvertedStatus(basicDevice).lastStatus;
        }
        //console.log(originalDevice.status);
        io.sockets.in(SocketRooms.ModulesRoom).emit(ModuleCommands.ChangeDeviceStatus, basicDeviceAsDevice(originalDevice));
      }
    });

    socket.on(ClientCommands.ChangeDeviceSettings, (device: BasicDevice) => {
      const originalDevice = getDevice(device.id);
      originalDevice.settings = device.settings;
      console.log(originalDevice.settings.automaticTimings);
      io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.DeviceSettingsChanged, originalDevice);
    });

    socket.on(ClientCommands.SetTimer, (deviceId: number, timer: Timer) => {
      setTimer(deviceId, timer);
    });

    socket.on("disconnect", () => {
      var index = clients.findIndex((x) => x.id === socket.id);
      clients.splice(index, 1);
      io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.SetConnectedCount, clients.length);
      socket.removeAllListeners(ClientCommands.Set);

      console.log("Client disconnect");
    });
  });

  //socket.emit(ModuleCommands.ResetToken);
  socket.on(ModuleCommands.Set, (token: string) => {
    console.log("Module connect");
    socket.join(SocketRooms.ModulesRoom);
    var connectedModule: Module = { id: socket.id, isReady: false, isResponded: false, token };
    modules.push(connectedModule);
    // Look forward to this one later. May need to be changed:
    io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.ModuleConnect, connectedModule);
    socket.emit(
      ModuleCommands.Configure,
      devices
        .filter((x) => x.configuration.moduleToken === connectedModule.token)
        .map((x) => {
          return {
            pinConfiguration: x.configuration.pinConfiguration,
            id: x.id,
            type: x.type,
            isAnalog: x.configuration.isAnalog,
            isSubmodule: x.configuration.isSubmodule,
          };
        })
    );

    socket.on(ModuleCommands.SetToken, () => {
      var newToken = generateRandomToken();
      socket.emit(ModuleCommands.SetToken, newToken);
      socket.disconnect();
    });

    socket.on(ModuleCommands.ConfigureResponse, () => {
      devices.forEach((value) => {
        if (value.configuration.isInverted) {
          const originalDevice = getDevice(value.id);
          originalDevice.status.futureStatus = getInvertedStatus(originalDevice).futureStatus;
          socket.emit(ModuleCommands.ChangeDeviceStatus, basicDeviceAsDevice(originalDevice));
        }
      });
      connectedModule.isReady = true;
      initPossibleClients();
    });

    socket.on(ModuleCommands.SetDevicesStatus, (moduleDevices: Array<Device>) => {
      moduleDevices.forEach((value) => {
        var originalDevice = getDevice(value.id);
        if (originalDevice.status.currentStatus !== StatusType.Waiting) {
          originalDevice.status = value.status;
          if (originalDevice.configuration.isInverted)
            originalDevice.status.currentStatus = getInvertedStatus(originalDevice).currentStatus;
        }
        if (hasDisconnected === false) {
          hasDisconnected = originalDevice.isConnected === false;
          Object.freeze(hasDisconnected);
        }
        originalDevice.isConnected = true;
      });
      connectedModule.isResponded = true;
      if (modules.filter((x) => x.isResponded).length >= modules.length) {
        modules.forEach((value) => (value.isResponded = false));
        // if (!clients.some((x) => x.isConfigured)) {
        //   io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.SetDevices, devices);
        // }
        for (const client of clients) {
          if (!client.isConfigured) {
            count++;
            client.isConfigured = true;
            io.sockets.in(client.id).emit(ClientCommands.SetDevices, devices);
          } else if (client.isConfigured && hasDisconnected) {
            io.sockets.in(client.id).emit(ClientCommands.SetDevices, devices);
          }
        }

        hasDisconnected = false;
      }
    });

    socket.on(ModuleCommands.DeviceStatusChanged, (device: Device) => {
      if (ignoredDevices.some((x) => x === device.id)) return;
      const originalDevice: BasicDevice = getDevice(device.id);
      if (originalDevice.configuration.isInverted) device.status.currentStatus = getInvertedStatus(device).currentStatus;
      originalDevice.status.currentStatus = device.status.currentStatus;
      Object.assign(originalDevice.status, device.status);
      console.log(originalDevice.status);
      io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.DeviceStatusChanged, basicDeviceAsDevice(originalDevice));
    });

    socket.on(ModuleCommands.DevicePinError, (device: Device) => {
      const originalDevice: BasicDevice = getDevice(device.id);
      io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.DevicePinError, originalDevice);
    });

    socket.on("disconnect", () => {
      console.log("Module disconnect");
      devices.forEach((value) => {
        if (value.configuration.moduleToken === connectedModule.token) {
          value.status = emptyStatus();
          value.isConnected = false;
        }
      });
      io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.SetDevices, devices);

      var index = modules.findIndex((x) => x.id === socket.id);
      modules.splice(index, 1);
      io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.ModuleDisconnect, connectedModule);
      socket.removeAllListeners(ModuleCommands.Set);
    });
  });
  // socket.onAny((name: string) => {
  //   console.log(name);
  // });

  function addTimeout(deviceId: number, toRun: Function, delay: number) {
    const originalDevice: BasicDevice = getDevice(deviceId);
    var timePassed = 0;
    io.sockets
      .in(SocketRooms.ClientsRoom)
      .emit(ClientCommands.SetTimer, deviceId, { timeLeft: getTimeFromMs(delay - timePassed) } as Timer);
    originalDevice.settings.timer = { timeLeft: getTimeFromMs(delay - timePassed) };

    var interval = setInterval(() => {
      timePassed += 1000;
      io.sockets
        .in(SocketRooms.ClientsRoom)
        .emit(ClientCommands.SetTimer, deviceId, { timeLeft: getTimeFromMs(delay - timePassed) } as Timer);
      originalDevice.settings.timer = { timeLeft: getTimeFromMs(delay - timePassed) };
    }, 1000);

    var timeout = setTimeout(() => {
      io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.SetTimer, deviceId, undefined);
      originalDevice.settings.timer = undefined;
      toRun();
      clearInterval(interval);
    }, delay);

    setTimer = (id: number, timer: Timer) => {
      if (id !== deviceId) return;
      const originalDevice: BasicDevice = getDevice(id);
      if (!timer) {
        clearTimeout(timeout);
        clearInterval(interval);
        var newStatus: DeviceStatus = {
          currentStatus: originalDevice.status.lastStatus,
          futureStatus: StatusType.None,
          lastStatus: StatusType.None,
        };
        if (originalDevice.configuration.isInverted) newStatus.currentStatus = getInvertedStatus(originalDevice).lastStatus;
        originalDevice.settings.timer = undefined;
        originalDevice.status = newStatus;
        var ignoredIndex = ignoredDevices.findIndex((x) => x === originalDevice.id) | 0;
        ignoredDevices.splice(ignoredIndex, 1);
        io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.SetTimer, id, undefined);
        io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.DeviceStatusChanged, basicDeviceAsDevice(originalDevice));
      }
    };
  }
});

function initPossibleClients() {
  if (clients.some((x) => x.isReady) && modules.some((x) => x.isReady)) {
    io.sockets.in(SocketRooms.ModulesRoom).emit(ModuleCommands.GetDevicesStatus);
  }
}

function generateRandomToken() {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < 16; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function getDevice(id: number): BasicDevice {
  return devices.find((x) => x.id === id) || devices[0];
}

function getInvertedStatus(device: Device, isAnalog: boolean = false) {
  var currentStatus: number, futureStatus: number, lastStatus: number;
  if (!isAnalog) {
    futureStatus = device.status.futureStatus == 1 ? 0 : 1;
    currentStatus = device.status.currentStatus == 1 ? 0 : 1;
    lastStatus = device.status.lastStatus == 1 ? 0 : 1;
  } else {
    futureStatus = 255 - device.status.futureStatus;
    currentStatus = 255 - device.status.currentStatus;
    lastStatus = 255 - device.status.lastStatus;
  }
  const status: DeviceStatus = { currentStatus, futureStatus, lastStatus };
  return status;
}

function basicDeviceAsDevice(basicDevice: BasicDevice): Device {
  var device: Device = { id: basicDevice.id, name: basicDevice.name, status: basicDevice.status, type: basicDevice.type };
  return device;
}

function getManualTiming(basicDevice: BasicDevice): ManualTimings {
  return basicDevice.settings.manualTimings;
}

function getTiming(type: ManualTimingType, timings: ManualTimings) {
  return timings.find((x) => x.type === type)?.time || emptyTime();
}

function hasTiming(type: TimingType, timings: ManualTimings): boolean {
  if (type === TimingType.Toggle) {
    var toggleDelay = getMsFromTime(getTiming(ManualTimingType.ToggleDelay, timings));
    return toggleDelay !== 0;
  } else if (type === TimingType.Pulse) {
    var pulseDelay = getMsFromTime(getTiming(ManualTimingType.PulseDelay, timings));
    var pulseTimeout = getMsFromTime(getTiming(ManualTimingType.PulseTimeout, timings));
    return pulseDelay !== 0 || pulseTimeout !== 0;
  }
  return false;
}

function swapStatus(status: DeviceStatus) {
  const temp = status.futureStatus;
  Object.freeze(temp);
  status.futureStatus = status.lastStatus;
  status.lastStatus = temp;
}

app.use(historyApi());

app.use("/", express.static(filePath));

// http.listen({ host: "192.168.1.115", port: port }, () => {
//   console.log(`Listening on port *:${port}`);
// });

// http.listen({ host: "192.168.1.102", port: port }, () => {
//   console.log(`Listening on port *:${port}`);
// });

http.listen(port, () => {
  console.log(`Listening on port *:${port}`);
});
