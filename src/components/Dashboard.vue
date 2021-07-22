<template>
    <div class="mt-5 ml-5 flex items-center flex-wrap gap-x-10 gap-y-1">
        <div class="flex items-center space-x-2">
            <div class="rounded-full w-5 h-5" :class="isCloudConnected ? 'bg-green-500' : 'bg-red-500'" />
            <div>{{ isCloudConnected ? "CLOUD CONNECTED" : "CLOUD DISCONNECTED" }}</div>
        </div>
        <div v-if="isCloudConnected" class="flex items-center space-x-2">
            <div class="rounded-full w-5 h-5" :class="getConnectedModuleCount > 0 ? 'bg-green-500' : 'bg-red-500'" />
            <div>{{ getConnectedModuleCount }}/{{ getUserModulesCount }} MODULES CONNECTED</div>
        </div>
        <div v-if="isCloudConnected" class="flex items-center space-x-2 mr-4">
            <div class="space-x-2">{{ state.connectedClientsCount + " Device(s) Connected" }}</div>
        </div>
    </div>
    <div v-if="isCloudConnected" class="max-w-7xl mx-auto pb-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
            <div class="flex items-center h-full lg:flex-row" :class="!isCloudConnected ? 'justify-center' : ''">
                <div class="p-5 m-10 h-full bg-gray-700 mx-auto rounded-lg shadow-2xl">
                    <div v-if="getDevices.length > 0" class="p-4 h-full flex gap-10 justify-center flex-row flex-wrap mx-auto select-none">
                        <LightDevice v-for="light in getDevices.filter((x) => x.type === DeviceType.Light)" :key="light.id" :deviceId="light.id" />
                        <RgbLightDevice v-for="rgbLight in getDevices.filter((x) => x.type === DeviceType.RgbLight)" :key="rgbLight.id" :deviceId="rgbLight.id" />
                    </div>
                    <h1 v-else class="text-white text-2xl">Loading data...</h1>

                    <!-- <div class="p-4">
                        <div class="bg-white rounded-lg p-4 shadow-2xl flex flex-wrap justify-center">
                            <h1 class="text-black text-2xl">Temp: {{ state.tempSensor.temperature }},&nbsp;</h1>
                            <h1 class="text-black text-2xl">Humidity: {{ state.tempSensor.humidity }}</h1>
                        </div>
                    </div> -->
                </div>
            </div>
        </div>
        <!-- /End replace -->
    </div>
    <div v-else class="mt-10">
        <h1 class="text-center font-bold text-2xl">Connecting...</h1>
    </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, onMounted, onUnmounted, reactive, ref, WritableComputedRef } from "vue";
import { DeviceType, ActionsType, GettersType, Light, StatusType, TempSensor, ErrorType, ClientCommands, ClientConfiguration, Module, Device, BasicDevice } from "../../types";
import { useStore } from "../store/store";
import LightDevice from "./LightDevice.vue";
import RgbLightDevice from "./RgbLightDevice.vue";
//import ErrorModal from "./modals/ErrorModal.vue";
//import LightSettingsModal from "./modals/LightSettingsModal.vue";

export default defineComponent({
    name: "Dashboard",
    components: {
        LightDevice,
        RgbLightDevice,
        //ErrorModal,
        //LightSettingsModal,
    },
    setup() {
        const store = useStore();

        const state = reactive({
            connectedClientsCount: 0,
            tempSensor: { temperature: "-", humidity: "-" } as TempSensor,
        });

        const isCloudConnected: WritableComputedRef<boolean> = computed({
            get(): boolean {
                return store.getters[GettersType.IsCloudConnected];
            },
            set(newValue: boolean) {
                store.dispatch(ActionsType.SetCloudConnected, newValue);
            },
        });

        const getDevices: ComputedRef<Array<BasicDevice>> = computed(() => {
            return store.getters[GettersType.GetDevices];
        });

        const getUserModulesCount: ComputedRef<number> = computed(() => {
            return store.state.configuration.registeredModuleTokens.length;
        });

        const getConnectedModuleCount: ComputedRef<number> = computed(() => {
            return store.state.connectedModules.length;
        });

        onMounted(() => {
            store.state.socket.on("connect", () => {
                store.state.socket.emit(ClientCommands.Set);
            });

            store.state.socket.on(ClientCommands.CloudConnect, () => {
                isCloudConnected.value = true;
            });
            store.state.socket.on(ClientCommands.Configure, (configuration: ClientConfiguration) => {
                store.dispatch(ActionsType.SetConfiguration, configuration);
                store.state.socket.emit(ClientCommands.ConfigureResponse);
            });
            store.state.socket.on(ClientCommands.ModuleConnect, (module: Module) => {
                if (store.state.configuration.registeredModuleTokens.some((x) => x === module.token)) {
                    store.dispatch(ActionsType.AddConnectedModule, module);
                }
            });
            store.state.socket.on(ClientCommands.ModuleDisconnect, (module: Module) => {
                if (store.state.configuration.registeredModuleTokens.some((x) => x === module.token)) {
                    store.dispatch(ActionsType.RemoveConnectedModule, module);
                }
            });
            store.state.socket.on(ClientCommands.SetConnectedCount, (count: number) => {
                state.connectedClientsCount = count;
            });
            store.state.socket.on(ClientCommands.SetDevices, (devices: Array<BasicDevice>) => {
                store.state.socket.emit(ClientCommands.SetDevicesResponse);
                store.dispatch(ActionsType.RemoveDevices);
                store.dispatch(ActionsType.SetDevices, devices);
                store.state.devices.forEach((value) => {
                    console.log(value.name + " " + value.status.currentStatus + " C");
                });
            });

            store.state.socket.onAny(onAny);

            store.state.socket.on("disconnect", () => {
                isCloudConnected.value = false;
                store.dispatch(ActionsType.ClearConnectedModules);
                store.dispatch(ActionsType.RemoveDevices);
                state.connectedClientsCount = 0;
            });
        });

        function onAny(name: string) {
            console.log(name);
        }

        onUnmounted(() => {
            store.state.socket.off(ClientCommands.DeviceSettingsChanged);
            store.state.socket.off(ClientCommands.CloudConnect);
            store.state.socket.off(ClientCommands.ModuleConnect);
            store.state.socket.off(ClientCommands.ModuleDisconnect);
            store.state.socket.off(ClientCommands.SetDevices);
            store.state.socket.off(ClientCommands.SetConnectedCount);
            store.state.socket.offAny(onAny);
        });

        //

        return {
            store,
            state,
            isCloudConnected,
            getUserModulesCount,
            getConnectedModuleCount,
            getDevices,
            StatusType,
            DeviceType,
        };
    },
});
</script>