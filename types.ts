import { Socket } from "socket.io-client";

// Devices with no configurations can just be called Device
// Devices with configurations such as scheduling can extend the SchedulingSettings interface
// Devices with specific configurations such as Analog, can extend Analog interface

// ------ Devices ------

export interface Light extends BasicDevice {}

export interface TemperatureSensor extends BasicDevice {
  status: TemperatureStatus;
}

export interface RandomAnalogDevice extends AnalogDevice {}

export interface TempSensor {
  temperature: string;
  humidity: string;
}

// ------ Base interfaces ------

export interface Device {
  id: number;
  name: string;
  status: DeviceStatus;
  type: DeviceType;
}

export interface AnalogDevice extends Device {
  status: AnalogStatus;
}

export interface BasicConfiguration {
  pinConfiguration: PinConfiguration;
  moduleToken: string;
  isAnalog: boolean;
}

export interface PinConfiguration {
  pin: number;
  pinCheck?: number;
}

export interface DeviceStatus {
  futureStatus: StatusType;
  currentStatus: StatusType;
  lastStatus: StatusType;
}

export interface TemperatureStatus extends DeviceStatus {
  temperature: number;
  humidity: number;
}

export interface AnalogStatus extends DeviceStatus {
  output: number;
}

export interface BasicDevice extends Device {
  settings: BasicSettings;
  configuration: BasicConfiguration;
}

export interface BasicSettings {
  timings?: SchedulingSettings;
  timeoutTime: Time;
}

export interface SchedulingSettings {
  manualTimings?: ManualTimings;
  timer?: Timer;
}

export interface ToggleTiming {
  toggleDelay: Time;
}

export interface PulseTiming {
  pulseDelay: Time;
  pulseTimeout: Time;
}

export interface ManualTimings {
  toggleTiming?: ToggleTiming;
  pulseTiming?: PulseTiming;
}

export interface Time {
  hour: number;
  minute: number;
  second: number;
}

export interface ModalState {
  isOpen: boolean;
  title?: string;
  text?: string;
}

export interface Timer {
  timeLeft?: Time;
}

export interface State {
  socket: Socket;
  devices: Array<BasicDevice>;
  configuration: ClientConfiguration;
  isUserLoggedIn: boolean;
  isCloudConnected: boolean;
  connectedModules: Array<Module>;
}

export interface DeviceSettingsState {
  settings: BasicSettings;
}

export interface ManualTimingPayload {
  type: ManualTimingType;
  time: Time;
}

export interface Module {
  id: string;
  token: string;
  isReady: boolean;
  isResponded: boolean;
}

export interface Client {
  id: string;
  isReady: boolean;
  isConfigured: boolean;
}

export interface ClientConfiguration {
  registeredModuleTokens: Array<string>;
}

// ------ Enums ------

export enum StatusType {
  None = "NONE",
  Off = "OFF",
  On = "ON",
  Waiting = "WAITING",
  Processing = "PROCESSING",
}

export enum DeviceType {
  None = "NONE",
  Light = "LIGHT",
  TemperatureSensor = "TEMPERATURE_SENSOR",
}

export enum ErrorType {
  LightFailure = "LIGHT_FAILURE",
  RequestTimeout = "REQUEST_TIMEOUT",
}

export enum TimingType {
  Toggle = "TOGGLE",
  Pulse = "PULSE",
}

// Mutation types
export enum MutationType {
  SetUserLoggedIn = "SET_USER_LOGGED_IN",
  SetCloudConnected = "SET_CLOUD_CONNECTED",
  AddConnectedModule = "ADD_MODULE_CONNECTED",
  RemoveConnectedModule = "REMOVE_MODULE_CONNECTED",
  ClearConnectedModules = "CLEAR_CONNECTED_MODULES",
  SetDevices = "SET_DEVICES",
  AddDevice = "ADD_DEVICE",
  RemoveDevice = "REMOVE_DEVICE",
  SetConfiguration = "SET_CONFIGURATION",
  SetManualTiming = "SET_MANUAL_TIMING",
}

// Action types
export enum ActionsType {
  SetUserLoggedIn = "setUserLoggedIn",
  SetCloudConnected = "setCloudConnected",
  AddConnectedModule = "addConnectedModule",
  RemoveConnectedModule = "removeConnectedModule",
  ClearConnectedModules = "clearConnectedModules",
  SetDevices = "setDevices",
  AddDevice = "addDevice",
  RemoveDevice = "removeDevice",
  SetConfiguration = "setConfiguration",
  SetManualTiming = "setManualTiming",
}

// Getters types
export enum GettersType {
  IsUserLoggedIn = "isUserLoggedIn",
  IsCloudConnected = "isCloudConnected",
  IsModuleConnected = "isModuleConnected",
  GetDevices = "getDevices",
  GetConfiguration = "getConfiguration",
  GetManualTiming = "getManualTiming",
}

export enum ModulesType {
  DeviceSettings = "deviceSettings",
}

export enum ModuleCommands {
  Set = "module:set",
  Configure = "module:configure",
  ConfigureResponse = "module:configure-response",
  GetDevicesStatus = "module:get-devices-status",
  SetDevicesStatus = "module:set-devices-status",
  ChangeDeviceStatus = "module:change-device-status",
  DeviceStatusChanged = "module:device-status-changed",
  DevicePinError = "module:device-pin-error",
  SetToken = "module:set-token",
  ResetToken = "module:reset-token",
}

export enum ClientCommands {
  Set = "client:set",
  CloudConnect = "client:cloud-connect",
  Configure = "client:configure",
  ConfigureResponse = "client:configure-response",
  SetConnectedCount = "client:set-connected-count",
  ModuleConnect = "client:module-connect",
  ModuleDisconnect = "client:module-disconnect",
  SetDevices = "client:set-devices",
  SetDevicesResponse = "client:set-devices-response",
  ChangeDeviceStatus = "client:change-device-status",
  DeviceStatusChanged = "client:device-status-changed",
  ChangeDeviceSettings = "client:change-device-settings",
  DeviceSettingsChanged = "client:device-settings-changed",
  DevicePinError = "client:device-pin-error",
  SetTimer = "client:set-timer",
}

export enum ManualTimingType {
  ToggleDelay = "TOGGLE_DELAY",
  PulseDelay = "PULSE_DELAY",
  PulseTimeout = "PULSE_TIMEOUT",
}

export enum SocketRooms {
  ClientsRoom = "clients",
  ModulesRoom = "modules",
}

// ------ Initializers ------

export function emptyStatus(): DeviceStatus {
  return {
    currentStatus: StatusType.None,
    futureStatus: StatusType.None,
    lastStatus: StatusType.None,
  };
}

export function emptySettings(): BasicSettings {
  return {
    timings: {
      timer: {},
      manualTimings: {
        pulseTiming: {
          pulseDelay: emptyTime(),
          pulseTimeout: emptyTime(),
        },
        toggleTiming: {
          toggleDelay: emptyTime(),
        },
      },
    },
    timeoutTime: getTimeFromMs(3000),
  };
}

export function emptyTime(): Time {
  return {
    hour: 0,
    minute: 0,
    second: 0,
  };
}

export function getMsFromTime(time: Time | undefined) {
  if (!time) return 0;
  return time.hour * 3600000 + time.minute * 60000 + time.second * 1000;
}

export function getTimeFromMs(ms: number) {
  var time: Time = { hour: 0, minute: 0, second: 0 };
  var seconds = Math.floor((ms / 1000) % 60),
    minutes = Math.floor((ms / (1000 * 60)) % 60),
    hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

  time.hour = hours;
  time.minute = minutes;
  time.second = seconds;

  return time;
}
