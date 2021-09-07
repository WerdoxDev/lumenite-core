import mqtt from "mqtt/dist/mqtt.min";
import { OutputDeviceClass } from "./classes";

// Devices with no configurations can just be called Device
// Devices with configurations such as scheduling can extend the SchedulingSettings interface

// ------ Devices ------
export interface Light extends OutputDevice {}

export interface TemperatureSensor extends DeviceStatus {
  status?: TemperatureDeviceStatus;
}

export interface RgbLight extends OutputDevice {
  config: RgbLightConfiguration;
  status?: RgbLightDeviceStatus;
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
  status?: DeviceStatus;
  readonly type: DeviceType;
}

export interface OutputConfiguration {
  pinConfig: PinConfiguration;
  moduleToken: string;
  validCommands: Array<number>;
  isAnalog: boolean;
  isSubmodule: boolean;
  isInverted: boolean;
}

export interface RgbLightConfiguration extends OutputConfiguration {
  pinConfig: RgbLightPinConfiguration;
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

// status: {futureStatus: {power:0}}

export interface Status {
  power: number;
}

export interface DeviceStatus {
  futureStatus: Status;
  currentStatus: Status;
  lastStatus: Status;
}

export interface RgbLightDeviceStatus extends DeviceStatus {
  futureStatus: RgbLightStatus;
  currentStatus: RgbLightStatus;
  lastStatus: RgbLightStatus;
}

export interface TemperatureDeviceStatus extends DeviceStatus {
  futureStatus: TemperatureStatus;
  currentStatus: TemperatureStatus;
  lastStatus: TemperatureStatus;
}

export interface RgbLightStatus extends Status {
  redValue: number;
  greenValue: number;
  blueValue: number;
}

export interface TemperatureStatus extends Status {
  temperature: number;
  humidity: number;
}

export interface OutputDevice extends Device {
  settings: OutputSettings;
  config: OutputConfiguration;
}

export interface OutputSettings {
  automaticTimings: AutomaticTimings;
  timeoutTime: number;
}

export interface RgbLightSettings extends OutputSettings {
  color: Color;
}

export interface Color {
  red: number;
  green: number;
  blue: number;
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

export interface State {
  mqtt: mqtt.MqttClient | undefined;
  id: string;
  devices: Array<OutputDeviceClass>;
  config: ClientConfiguration;
  isUserLoggedIn: boolean;
  isCloudConnected: boolean;
}

export interface Module {
  token: string;
  isReady: boolean;
}

export interface Client {
  id: string;
  isReady: boolean;
  config: ClientConfiguration;
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

export type AutomaticTimings = Array<AutomaticTiming>;

export interface SettingsModalMenu {
  id: number;
  text: string;
  isHeader: boolean;
}

export interface Option {
  id: number;
  text: string;
  selected: boolean;
}

export interface SequenceItemsTab {
  id: number;
  text: string;
  color: string;
  selected: boolean;
}

export interface SequenceItem {
  id: number;
  tabId: number;
  text: string;
}

export interface SequenceProgramItem {
  id: number;
  itemId: number;
  text: string;
  isPreview: boolean;
}

export interface DeviceSequenceItems {
  type: DeviceType;
  itemIds: Array<number>;
}

export interface ChangeDeviceStatusPayload {
  id: number;
  type: DeviceType;
  status: DeviceStatus;
}

export interface ClientInitializePayload {
  devices: Array<OutputDevice>;
  config: ClientConfiguration;
}

export interface ModuleDeviceSettingsPayload {
  id: number;
  type: DeviceType;
  settings: OutputSettings;
}

export interface ModuleDeviceStatusPayload {
  id: number;
  type: DeviceType;
  status: {
    currentStatus: number;
  };
}

// 0: Power command. Payload: 0 or 1.
export interface Command {
  id: number;
  deviceId: number;
  payload: Array<string>;
}

export type ClientSetConnectedPayload = Array<number>;

export interface ClientSetDevicesPayload {
  id: number;
  status: DeviceStatus;
}

// ------ Enums ------

export enum StatusType {
  None = -4,
  Opposite = -5,
  Offline = -3,
  Off = 0,
  On = 1,
  Waiting = -2,
  Processing = -1,
}

export enum DeviceType {
  None = "NONE",
  OutputDevice = "OUTPUT_DEVICE",
  RgbLight = "RGB_LIGHT",
  TemperatureSensor = "TEMPERATURE_SENSOR",
}

export enum ErrorType {
  DeviceFailure = "DEVICE_FAILURE",
  RequestTimeout = "REQUEST_TIMEOUT",
}

export enum CommandType {
  Power = 0,
  PowerChanged = 1,
}

export enum SequenceItemType {
  SetPower = 0,
  TogglePower = 1,
  If = 2,
  Loop = 3,
  WaitInSeconds = 4,
}

// ------ Initializers ------

export function emptyDeviceStatus(type?: DeviceType): DeviceStatus {
  var value: DeviceStatus = {
    futureStatus: emptyStatus(type),
    currentStatus: emptyStatus(type),
    lastStatus: emptyStatus(type),
  };
  return value;
}

export function emptyStatus(type?: DeviceType): Status {
  var value: Status = {
    power: StatusType.None,
  };
  if (type === DeviceType.RgbLight) {
    value = Object.assign(value, { redValue: 0, greenValue: 0, blueValue: 0 });
  }
  return value;
}

export function emptySettings(type?: DeviceType): OutputSettings {
  var value: OutputSettings = {
    automaticTimings: [],
    timeoutTime: 3000,
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

var generatedIds: Array<string> = [];

export function getRandomId() {
  function generate() {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < 16; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  var id = generate();
  while (generatedIds.some((x) => x === id)) {
    id = generate();
  }

  return id;
}

export function checkTopic(topic: string, match: string, ...ignores: Array<number>) {
  var splitTopic = topic.split("/");
  for (let i = 0; i < ignores.length; i++) {
    if (i > 0) {
      splitTopic.splice(ignores[i] - ignores[i - 1], 1);
    } else {
      splitTopic.splice(ignores[i], 1);
    }
  }
  var newTopic = splitTopic.join("/");
  return newTopic === match;
}

export function stringJson(json: object) {
  return JSON.stringify(json);
}

export function parseJson(string: string) {
  return JSON.parse(string);
}

export function basicDeviceAsDevice(basicDevice: OutputDevice): Device {
  var device: Device = { id: basicDevice.id, name: basicDevice.name, status: basicDevice.status, type: basicDevice.type };
  return device;
}

// FutureStatus: {status: {1}, temp: 10}
// CurrentStatus: {status: {0}, temp: 5}
// LastStatus: {status: {1}, temp: 90}
