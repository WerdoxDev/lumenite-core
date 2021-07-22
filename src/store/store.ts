import { io } from "socket.io-client";
import { InjectionKey } from "vue";
import { useStore as baseUseStore, Store, createStore } from "vuex";
import { State, MutationType, ActionsType, GettersType, ClientConfiguration, Module, BasicDevice, ModulesType } from "../../types";

export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
  state: {
    socket: io("https://lumenite.matin-tat.ir", { autoConnect: false }),
    // socket: io("http://192.168.1.115:3001", { autoConnect: false }),
    // socket: io("http://192.168.1.102:3001", { autoConnect: false }),
    devices: [],
    configuration: { registeredModuleTokens: [] },
    isUserLoggedIn: false,
    isCloudConnected: false,
    connectedModules: [],
  },
  mutations: {
    [MutationType.SetUserLoggedIn](state: State, isLoggedIn: boolean) {
      state.isUserLoggedIn = isLoggedIn;
    },
    [MutationType.SetCloudConnected](state: State, isCloudConnected: boolean) {
      state.isCloudConnected = isCloudConnected;
    },
    [MutationType.AddConnectedModule](state: State, module: Module) {
      if (state.connectedModules.some((x) => x.token === module.token)) return;
      state.connectedModules.push(module);
    },
    [MutationType.RemoveConnectedModule](state: State, module: Module) {
      var index = state.connectedModules.findIndex((x) => x.token === module.token);
      state.connectedModules.splice(index, 1);
    },
    [MutationType.ClearConnectedModules](state: State) {
      state.connectedModules.splice(0, state.connectedModules.length);
    },
    [MutationType.SetDevices](state: State, devices: Array<BasicDevice>) {
      devices.forEach((value) => {
        state.devices.push(value);
      });
    },
    [MutationType.AddDevice](state: State, device: BasicDevice) {
      state.devices.push(device);
    },
    [MutationType.RemoveDevices](state: State) {
      state.devices.splice(0, state.devices.length);
    },
    [MutationType.SetConfiguration](state: State, configuration: ClientConfiguration) {
      state.configuration = configuration;
    },
  },
  actions: {
    [ActionsType.SetUserLoggedIn]({ commit }, isLoggedIn: boolean) {
      commit(MutationType.SetUserLoggedIn, isLoggedIn);
    },
    [ActionsType.SetCloudConnected]({ commit }, isCloudConnected: boolean) {
      commit(MutationType.SetCloudConnected, isCloudConnected);
    },
    [ActionsType.AddConnectedModule]({ commit }, module: Module) {
      commit(MutationType.AddConnectedModule, module);
    },
    [ActionsType.ClearConnectedModules]({ commit }) {
      commit(MutationType.ClearConnectedModules);
    },
    [ActionsType.RemoveConnectedModule]({ commit }, module: Module) {
      commit(MutationType.RemoveConnectedModule, module);
    },
    [ActionsType.SetDevices]({ commit }, devices: Array<BasicDevice>) {
      commit(MutationType.SetDevices, devices);
    },
    [ActionsType.AddDevice]({ commit }, device: BasicDevice) {
      commit(MutationType.AddDevice, device);
    },
    [ActionsType.RemoveDevices]({ commit }) {
      commit(MutationType.RemoveDevices);
    },
    [ActionsType.SetConfiguration]({ commit }, configuration: ClientConfiguration) {
      commit(MutationType.SetConfiguration, configuration);
    },
  },
  getters: {
    [GettersType.IsUserLoggedIn](state: State) {
      return state.isUserLoggedIn;
    },
    [GettersType.IsCloudConnected](state: State) {
      return state.isCloudConnected;
    },
    [GettersType.IsModuleConnected]: (state: State) => (token: string) => {
      return state.connectedModules.some((x) => x.token === token);
    },
    [GettersType.GetDevices](state: State) {
      return state.devices;
    },
    [GettersType.GetConfiguration](state: State) {
      return state.configuration;
    },
  },
});

export function useStore() {
  return baseUseStore(key);
}
