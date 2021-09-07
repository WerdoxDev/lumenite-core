import mqtt from "mqtt/dist/mqtt.min";
import { reactive } from "vue";
import { BasicDeviceClass } from "../../classes";
import { ClientConfiguration, getRandomId, State } from "../../types";

export const store = {
  state: reactive<State>({
    mqtt: undefined,
    id: getRandomId(),
    // socket: io("http://192.168.1.102:3001", { autoConnect: false }),
    devices: [],
    config: { registeredModuleTokens: [] },
    isUserLoggedIn: false,
    isCloudConnected: false,
  }),

  connectMqtt() {
    this.state.mqtt = mqtt.connect("ws://192.168.1.115:8080", mqttOptions);
  },
  disconnectMqtt() {
    this.state.mqtt?.publish("client/offline", this.state.id);
    this.state.mqtt?.removeAllListeners();
    this.state.mqtt?.end();
  },
  setDevices(devices: Array<BasicDeviceClass>) {
    this.state.devices.splice(0, this.state.devices.length);
    devices.forEach((x) => {
      this.state.devices.push(x);
    });
  },
  setConfiguration(config: ClientConfiguration) {
    this.state.config = config;
  },
  setUsedLoggedIn(loggedIn: boolean) {
    this.state.isUserLoggedIn = loggedIn;
  },
  setCloudConnected(connected: boolean) {
    this.state.isCloudConnected = connected;
  },
};

const mqttOptions: mqtt.IClientOptions = {
  // host: "211b94aa7734472e8c384db21d25fc6d.s2.eu.hivemq.cloud",
  // username: "lumenite",
  // password: "Lumenite2021",
  keepalive: 15,
  will: {
    topic: `client/offline`,
    payload: store.state.id,
    qos: 0,
    retain: false,
  },
  // protocol: "mqtts",
};
