import { store } from "./src/store/store";
import {
  OutputDevice,
  OutputSettings,
  OutputConfiguration,
  DeviceStatus,
  DeviceType,
  State,
  StatusType,
  ChangeDeviceStatusPayload,
  stringJson,
  RgbLight,
  RgbLightConfiguration,
  RgbLightStatus,
  RgbLightSettings,
  Command,
  CommandType,
  getTimeFromMs,
  Status,
  emptyStatus,
  RgbLightDeviceStatus,
} from "./types";

export class OutputDeviceClass implements OutputDevice {
  settings: OutputSettings;
  config: OutputConfiguration;
  readonly id: number;
  name: string;
  status?: DeviceStatus | undefined;
  type: DeviceType;

  constructor(
    id: number,
    name: string,
    type: DeviceType,
    status: DeviceStatus | undefined,
    config: OutputConfiguration,
    settings: OutputSettings
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.status = status;
    this.config = config;
    this.settings = settings;
  }

  setStatus(futureStatus: Status, currentStatus: Status, lastStatus: Status): boolean {
    if (!this.isInValidState) return false;
    this.futureStatus = futureStatus;
    this.currentStatus = currentStatus;
    this.lastStatus = lastStatus;
    var command: Command = {
      id: CommandType.Power,
      deviceId: this.id,
      payload: [stringJson(this.futureStatus), stringJson(this.lastStatus)],
    };

    store.state.mqtt?.publish(`module/${this.config.moduleToken}/execute-command`, stringJson(command));
    return true;
  }

  get isInValidState() {
    var currentStatus = this.currentStatus;
    return (
      currentStatus.power !== StatusType.None &&
      currentStatus.power !== StatusType.Offline &&
      currentStatus.power !== StatusType.Waiting &&
      currentStatus.power !== StatusType.Processing
    );
  }

  get futureStatus(): Status {
    if (this.status !== undefined) return this.status.futureStatus;
    else return emptyStatus();
  }
  set futureStatus(value: Status) {
    if (this.status !== undefined) {
      this.status.futureStatus = value;
    } else throw new Error("FutureStatus was null!");
  }

  get currentStatus(): Status {
    if (this.status !== undefined) return this.status.currentStatus;
    else return emptyStatus();
  }
  set currentStatus(value: Status) {
    if (this.status !== undefined) {
      this.status.currentStatus = value;
    } else throw new Error("CurrentStatus was null!");
  }

  get lastStatus(): Status {
    if (this.status !== undefined) return this.status.lastStatus;
    else return emptyStatus();
  }
  set lastStatus(value: Status) {
    if (this.status !== undefined) {
      this.status.lastStatus = value;
    } else throw new Error("LastStatus was null!");
  }

  ///Only works with devices that have ON and OFF as status
  oppositeStatus(status: Status): Status {
    return status.power === StatusType.On ? { power: StatusType.Off } : { power: StatusType.On };
  }
}

class RgbLightClass extends OutputDeviceClass implements RgbLight {
  config: RgbLightConfiguration;
  status?: RgbLightDeviceStatus;
  settings: RgbLightSettings;

  constructor(
    id: number,
    name: string,
    type: DeviceType,
    status: RgbLightDeviceStatus | undefined,
    config: RgbLightConfiguration,
    settings: RgbLightSettings
  ) {
    super(id, name, type, status, config, settings);
    this.status = status;
    this.config = config;
    this.settings = settings;
  }

  setColor(red: number, green: number, blue: number) {
    this.status!.currentStatus.redValue = red;
    this.status!.currentStatus.greenValue = green;
    this.status!.currentStatus.blueValue = blue;
  }
}
