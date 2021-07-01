import { io } from "socket.io-client";
import { InjectionKey } from "vue";
import { useStore as baseUseStore, Store, createStore } from "vuex";
import { State, MutationType, ActionsType, GettersType } from "../../types";

export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
    state: {
        // socket: io("https://lumenite.matin-tat.ir", { autoConnect: false }),
        socket: io("http://192.168.1.115:3001", { autoConnect: false }),
        isUserLoggedIn: false,
        isCloudConnected: false,
        isModuleConnected: false
    },
    mutations: {
        [MutationType.SetUserLoggedIn](state, isLoggedIn: boolean) {
            state.isUserLoggedIn = isLoggedIn;
        },
        [MutationType.SetCloudConnected](state, isCloudConnected: boolean) {
            state.isCloudConnected = isCloudConnected;
        },
        [MutationType.SetModuleConnected](state, isModuleConnected: boolean) {
            state.isModuleConnected = isModuleConnected;
        }
    },
    actions: {
        [ActionsType.SetUserLoggedIn]({ commit }, isLoggedIn) {
            commit(MutationType.SetUserLoggedIn, isLoggedIn);
        },
        [ActionsType.SetCloudConnected]({ commit }, isCloudConnected) {
            commit(MutationType.SetCloudConnected, isCloudConnected);
        },
        [ActionsType.SetModuleConnected]({ commit }, isModuleConnected) {
            commit(MutationType.SetModuleConnected, isModuleConnected);
        }
    },
    getters: {
        [GettersType.IsUserLoggedIn](state) {
            return state.isUserLoggedIn;
        },
        [GettersType.IsCloudConnected](state) {
            return state.isCloudConnected;
        },
        [GettersType.isModuleConnected](state) {
            return state.isModuleConnected;
        }
    }
});

export function useStore() {
    return baseUseStore(key);
}