import mqtt from "mqtt/dist/mqtt.min";
import { InjectionKey } from "vue";
import { useStore as baseUseStore, Store, createStore } from "vuex";
import { BasicDeviceClass } from "../../classes";
import { State, MutationType, ActionsType, GettersType, ClientConfiguration, BasicDevice, getRandomId } from "../../types";

export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
  state: {
    // socket: io("https://lumenite.matin-tat.ir", { autoConnect: false }),
    mqtt: undefined,
    id: getRandomId(),
    // socket: io("http://192.168.1.102:3001", { autoConnect: false }),
    devices: [],
    configuration: { registeredModuleTokens: [] },
    isUserLoggedIn: false,
    isCloudConnected: false,
  },
  mutations: {
    [MutationType.SetUserLoggedIn](state: State, isLoggedIn: boolean) {
      state.isUserLoggedIn = isLoggedIn;
    },
    [MutationType.SetCloudConnected](state: State, isCloudConnected: boolean) {
      state.isCloudConnected = isCloudConnected;
    },
    [MutationType.SetDevices](state: State, devices: Array<BasicDeviceClass>) {
      state.devices.splice(0, state.devices.length);
      devices.forEach((value) => {
        state.devices.push(value);
      });
    },
    [MutationType.SetConfiguration](state: State, configuration: ClientConfiguration) {
      state.configuration = configuration;
    },
    [MutationType.ConnectMqtt](state: State) {
      state.mqtt = mqtt.connect("ws://192.168.1.115:8080", mqttOptions);
    },
  },
  actions: {
    [ActionsType.SetUserLoggedIn]({ commit }, isLoggedIn: boolean) {
      commit(MutationType.SetUserLoggedIn, isLoggedIn);
    },
    [ActionsType.SetCloudConnected]({ commit }, isCloudConnected: boolean) {
      commit(MutationType.SetCloudConnected, isCloudConnected);
    },
    [ActionsType.SetDevices]({ commit }, devices: Array<BasicDevice>) {
      commit(MutationType.SetDevices, devices);
    },
    [ActionsType.SetConfiguration]({ commit }, configuration: ClientConfiguration) {
      commit(MutationType.SetConfiguration, configuration);
    },
    [ActionsType.ConnectMqtt]({ commit }) {
      commit(MutationType.ConnectMqtt);
    },
  },
  getters: {
    [GettersType.IsUserLoggedIn](state: State) {
      return state.isUserLoggedIn;
    },
    [GettersType.IsCloudConnected](state: State) {
      return state.isCloudConnected;
    },
  },
});

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

export function useStore() {
  return baseUseStore(key);
}
