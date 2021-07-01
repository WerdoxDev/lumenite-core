import express from "express";
import Http from "http";
import SocketIO from "socket.io";
import historyApi from "connect-history-api-fallback";
import path from "path";
import {
  BasicDevice,
  BasicSettings,
  Client,
  ClientCommands,
  ClientConfiguration,
  Device,
  DeviceStatus,
  DeviceType,
  emptySettings,
  emptyStatus,
  getMsFromTime,
  getTimeFromMs,
  Light,
  Module,
  ModuleCommands,
  SocketRooms,
  StatusType,
  TemperatureSensor,
  Time,
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

//5 12     4 14
const moduleToken1 = "fjqX1cLaviE715jb";
const moduleToken2 = "vpfGfzzeVxjZ9nS2";

var devices: Array<BasicDevice> = [
  {
    id: 0,
    name: "Light 1",
    type: DeviceType.Light,
    configuration: { pinConfiguration: { pin: 5, pinCheck: 12 }, moduleToken: moduleToken1, isAnalog: false },
    status: emptyStatus(),
    settings: emptySettings(),
  } as Light,
  {
    id: 1,
    name: "Light 2",
    type: DeviceType.Light,
    configuration: { pinConfiguration: { pin: 4, pinCheck: 14 }, moduleToken: moduleToken1, isAnalog: false },
    status: emptyStatus(),
    settings: emptySettings(),
  } as Light,
  {
    id: 2,
    name: "Light 3",
    type: DeviceType.Light,
    configuration: { pinConfiguration: { pin: 5, pinCheck: 12 }, moduleToken: moduleToken2, isAnalog: false },
    status: emptyStatus(),
    settings: emptySettings(),
  } as Light,
  {
    id: 3,
    name: "Light 4",
    type: DeviceType.Light,
    configuration: { pinConfiguration: { pin: 4, pinCheck: 14 }, moduleToken: moduleToken2, isAnalog: false },
    status: emptyStatus(),
    settings: emptySettings(),
  } as Light,
  {
    id: 4,
    name: "Temperature Sensor 1",
    type: DeviceType.TemperatureSensor,
    configuration: { pinConfiguration: { pin: 13 }, moduleToken: moduleToken1, isAnalog: false },
    status: emptyStatus(),
    settings: emptySettings(),
  } as TemperatureSensor,
];

const ignoredDevices: Array<number> = [];

const clientConfiguration: ClientConfiguration = {
  registeredModuleTokens: [moduleToken1, moduleToken2],
};

const modules: Array<Module> = [];
const clients: Array<Client> = [];

var setTimer: Function;

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
      modules.forEach((value) => {
        socket.emit(ClientCommands.ModuleConnect, value);
      });
      initPossibleClients();
    });
    socket.on(ClientCommands.SetDevicesResponse, () => {
      connectedClient.isConfigured = true;
    });
    socket.on(ClientCommands.ChangeDeviceStatus, (device: BasicDevice, timingMode: TimingType) => {
      var index = devices.findIndex((x) => x.id === device.id);

      var filteredDevice: Device = { id: device.id, name: device.name, status: device.status, type: device.type };
      var deviceManualTiming = devices.find((x) => x.id === device.id)?.settings.timings?.manualTimings;

      var status: DeviceStatus = {
        currentStatus: StatusType.Waiting,
        futureStatus: device.status.futureStatus,
        lastStatus: device.status.lastStatus,
      };
      if (timingMode === TimingType.Toggle && getMsFromTime(deviceManualTiming?.toggleTiming?.toggleDelay) !== 0) {
        var newDevice: Device = { id: device.id, name: device.name, status: status, type: device.type };
        io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.DeviceStatusChanged, newDevice);
        devices[index].status = status;
        addTimeout(
          device.id,
          () => {
            io.sockets.in(SocketRooms.ModulesRoom).emit(ModuleCommands.ChangeDeviceStatus, filteredDevice);
          },
          getMsFromTime(deviceManualTiming?.toggleTiming?.toggleDelay)
        );
      } else if (
        timingMode === TimingType.Pulse &&
        (getMsFromTime(deviceManualTiming?.pulseTiming?.pulseDelay) !== 0 ||
          getMsFromTime(deviceManualTiming?.pulseTiming?.pulseTimeout) !== 0)
      ) {
        var newDevice: Device = { id: device.id, name: device.name, status, type: device.type };
        io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.DeviceStatusChanged, newDevice);
        devices[index].status = status;
        addTimeout(
          device.id,
          () => {
            ignoredDevices.push(device.id);
            io.sockets.in(SocketRooms.ModulesRoom).emit(ModuleCommands.ChangeDeviceStatus, filteredDevice);
            var temp = { status: status.futureStatus };
            status.futureStatus = status.lastStatus;
            status.lastStatus = temp.status;
            io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.DeviceStatusChanged, newDevice);
            devices[index].status = status;
            addTimeout(
              device.id,
              () => {
                var index = ignoredDevices.findIndex((x) => x === device.id);
                ignoredDevices.splice(index, 1);
                io.sockets.in(SocketRooms.ModulesRoom).emit(ModuleCommands.ChangeDeviceStatus, newDevice);
              },
              getMsFromTime(deviceManualTiming?.pulseTiming?.pulseTimeout)
            );
          },
          getMsFromTime(deviceManualTiming?.pulseTiming?.pulseDelay)
        );
      } else {
        io.sockets.in(SocketRooms.ModulesRoom).emit(ModuleCommands.ChangeDeviceStatus, filteredDevice);
      }
    });
    socket.on(ClientCommands.ChangeDeviceSettings, (device: BasicDevice, newSettings: BasicSettings) => {
      var index = devices.findIndex((x) => x.id === device.id);
      devices[index].settings = newSettings;
      io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.DeviceSettingsChanged, device, newSettings);
    });
    socket.on(ClientCommands.SetTimer, (device: Device, timer: Timer) => {
      setTimer(device, timer);
    });
    socket.on("disconnect", () => {
      var index = clients.findIndex((x) => x.id === socket.id);
      console.log("Client disconnect");
      clients.splice(index, 1);
      io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.SetConnectedCount, clients.length);
      socket.removeAllListeners(ClientCommands.Set);
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
          return { pinConfiguration: x.configuration.pinConfiguration, id: x.id, type: x.type, isAnalog: x.configuration.isAnalog };
        })
    );
    socket.on(ModuleCommands.SetToken, () => {
      var newToken = generateRandomToken();
      socket.emit(ModuleCommands.SetToken, newToken);
      socket.disconnect();
    });
    socket.on(ModuleCommands.ConfigureResponse, () => {
      connectedModule.isReady = true;
      initPossibleClients();
    });
    socket.on(ModuleCommands.SetDevicesStatus, (moduleDevices: Array<Device>) => {
      moduleDevices.forEach((value) => {
        var device = devices.find((x) => x.id === value.id);
        if (device?.status.currentStatus !== StatusType.Waiting) {
          device!.status = value.status;
        }
      });
      connectedModule.isResponded = true;
      if (modules.filter((x) => x.isResponded).length >= modules.length) {
        modules.forEach((value) => (value.isResponded = false));
        clients.forEach((value) => {
          if (!value.isConfigured) {
            io.sockets.in(value.id).emit(ClientCommands.SetDevices, devices);
          }
        });
      }
    });
    socket.on(ModuleCommands.DeviceStatusChanged, (device: Device) => {
      if (ignoredDevices.some((x) => x === device.id)) return;
      var index = devices.findIndex((x) => x.id === device.id);
      device.status.futureStatus = devices[index].status.futureStatus;
      device.status.lastStatus = devices[index].status.lastStatus;
      devices[index].status.currentStatus = device.status.currentStatus;
      io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.DeviceStatusChanged, device);
    });
    socket.on(ModuleCommands.DevicePinError, (device: Device) => {
      var index = devices.findIndex((x) => x.id === device.id);
      device.name = devices[index].name;
      io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.DevicePinError, device);
    });
    socket.on("disconnect", () => {
      console.log("Module disconnect");
      var index = modules.findIndex((x) => x.id === socket.id);
      modules.splice(index, 1);
      io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.ModuleDisconnect, connectedModule);
      socket.removeAllListeners(ModuleCommands.Set);
    });
  });
  socket.onAny((name: string) => {
    console.log(name);
  });

  function addTimeout(deviceId: number, toRun: Function, delay: number) {
    var index = devices.findIndex((x) => x.id === deviceId);
    var timePassed = 0;
    io.sockets
      .in(SocketRooms.ClientsRoom)
      .emit(ClientCommands.SetTimer, deviceId, { timeLeft: getTimeFromMs(delay - timePassed) } as Timer);
    devices[index].settings.timings!.timer = { timeLeft: getTimeFromMs(delay - timePassed) };

    var interval = setInterval(() => {
      timePassed += 1000;
      io.sockets
        .in(SocketRooms.ClientsRoom)
        .emit(ClientCommands.SetTimer, deviceId, { timeLeft: getTimeFromMs(delay - timePassed) } as Timer);
      devices[index].settings.timings!.timer = { timeLeft: getTimeFromMs(delay - timePassed) };
    }, 1000);

    var timeout = setTimeout(() => {
      io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.SetTimer, deviceId, undefined);
      devices[index].settings.timings!.timer = undefined;
      toRun();
      clearInterval(interval);
    }, delay);

    setTimer = (device: Device, timer: Timer) => {
      if (device.id !== deviceId) return;
      if (!timer) {
        clearTimeout(timeout);
        clearInterval(interval);
        var newStatus: DeviceStatus = {
          currentStatus: device.status.lastStatus,
          futureStatus: StatusType.None,
          lastStatus: StatusType.None,
        };
        var newDevice: Device = { id: device.id, name: device.name, status: newStatus, type: device.type };
        io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.SetTimer, deviceId, undefined);
        io.sockets.in(SocketRooms.ClientsRoom).emit(ClientCommands.DeviceStatusChanged, newDevice);
        devices[index].settings.timings!.timer = undefined;
        devices[index].status.currentStatus = newStatus.currentStatus;
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

app.use(historyApi());

app.use("/", express.static(filePath));

// http.listen({ host: "192.168.1.115", port: port }, () => {
//   console.log(`Listening on port *:${port}`);
// });

http.listen(port, () => {
  console.log(`Listening on port *:${port}`);
});
