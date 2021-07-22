import { Socket } from "socket.io-client";

// Devices with no configurations can just be called Device
// Devices with configurations such as scheduling can extend the SchedulingSettings interface

// ------ Devices ------

export interface Light extends BasicDevice {}

export interface TemperatureSensor extends BasicDevice {
  status: TemperatureStatus;
}

export interface RgbLight extends BasicDevice {
  configuration: RgbLightConfiguration;
  status: RgbLightStatus;
  settings: RgbLightSettings;
}

export interface TempSensor {
  temperature: string;
  humidity: string;
}

// ------ Base interfaces ------

export interface Device {
  readonly id: number;
  name: string;
  status: DeviceStatus;
  readonly type: DeviceType;
}

export interface BasicConfiguration {
  pinConfiguration: PinConfiguration;
  moduleToken: string;
  isAnalog: boolean;
  isSubmodule: boolean;
  isInverted: boolean;
}

export interface RgbLightConfiguration extends BasicConfiguration {
  pinConfiguration: RgbLightPinConfiguration;
}

export interface PinConfiguration {
  pin: number;
  pinCheck?: number;
}

export interface RgbLightPinConfiguration extends PinConfiguration {
  redPin: number;
  greenPin: number;
  bluePin: number;
}

export interface DeviceStatus {
  futureStatus: number;
  currentStatus: number;
  lastStatus: number;
}

export interface RgbLightStatus extends DeviceStatus {
  redValue: number;
  greenValue: number;
  blueValue: number;
}

export interface TemperatureStatus extends DeviceStatus {
  temperature: number;
  humidity: number;
}

export interface BasicDevice extends Device {
  settings: BasicSettings;
  configuration: BasicConfiguration;
  isConnected: boolean;
}

export interface BasicSettings {
  manualTimings: ManualTimings;
  automaticTimings: AutomaticTimings;
  timer?: Timer;
  timeoutTime: Time;
}

export interface RgbLightSettings extends BasicSettings {
  color: Color;
}

export interface Color {
  red: number;
  green: number;
  blue: number;
}

export interface ToggleTiming {
  toggleDelay: Time;
}

export interface PulseTiming {
  pulseDelay: Time;
  pulseTimeout: Time;
}

export interface Timing {
  type: ManualTimingType;
  time: Time;
}

export interface AutomaticTiming {
  id: number;
  name: string;
  dates: Array<AutomaticDate>;
  weekdays: Array<AutomaticWeekday>;
  // TODO: Add the actual time here later
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

export interface SettingsModalMenu {
  id: number;
  name: string;
  isHeader: boolean;
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

export interface Weekday {
  id: number;
  text: string;
  selected: boolean;
}

export interface AutomaticDate {
  year: number;
  month: number;
  date: number;
}

export interface AutomaticWeekday {
  day: number;
}

export interface CalendarDate {
  index: number;
  date: number;
  day: number;
  month: number;
  timestamp: number;
  dayString: string;
  isDiffMonth: boolean;
  isToday: boolean;
  selected: boolean;
}

export interface Calendar {
  selectedDates: Array<number>;
  month: number;
  year: number;
}

export type ManualTimings = Array<Timing>;

export type AutomaticTimings = Array<AutomaticTiming>;

// ------ Enums ------

export enum StatusType {
  None = -3,
  Off = 0,
  On = 1,
  Waiting = -2,
  Processing = -1,
}

export enum DeviceType {
  None = "NONE",
  Light = "LIGHT",
  RgbLight = "RGB_LIGHT",
  TemperatureSensor = "TEMPERATURE_SENSOR",
}

export enum ErrorType {
  LightFailure = "LIGHT_FAILURE",
  RequestTimeout = "REQUEST_TIMEOUT",
}

export enum TimingType {
  None = "NONE",
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
  RemoveDevices = "REMOVE_DEVICES",
  SetConfiguration = "SET_CONFIGURATION",
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
  RemoveDevices = "removeDevices",
  SetConfiguration = "setConfiguration",
}

// Getters types
export enum GettersType {
  IsUserLoggedIn = "isUserLoggedIn",
  IsCloudConnected = "isCloudConnected",
  IsModuleConnected = "isModuleConnected",
  GetDevices = "getDevices",
  GetConfiguration = "getConfiguration",
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

export function emptyStatus(type?: DeviceType): DeviceStatus {
  if (type === DeviceType.RgbLight) {
    return {
      currentStatus: StatusType.None,
      futureStatus: StatusType.None,
      lastStatus: StatusType.None,
      redValue: 0,
      blueValue: 0,
      greenValue: 0,
    } as RgbLightStatus;
  } else {
    return {
      currentStatus: StatusType.None,
      futureStatus: StatusType.None,
      lastStatus: StatusType.None,
    };
  }
}

export function emptySettings(type?: DeviceType): BasicSettings {
  var value: BasicSettings = {
    timer: {},
    manualTimings: [
      {
        type: ManualTimingType.PulseDelay,
        time: emptyTime(),
      },
      {
        type: ManualTimingType.PulseTimeout,
        time: emptyTime(),
      },
      {
        type: ManualTimingType.ToggleDelay,
        time: emptyTime(),
      },
    ],
    automaticTimings: [],
    timeoutTime: getTimeFromMs(3000),
  };
  if (type === DeviceType.RgbLight) {
    value = Object.assign(value, { color: emptyColor() });
  }
  return value;
}

export function emptyTime(): Time {
  return {
    hour: 0,
    minute: 0,
    second: 0,
  };
}

export function emptyColor(): Color {
  return {
    red: 0,
    green: 0,
    blue: 0,
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
