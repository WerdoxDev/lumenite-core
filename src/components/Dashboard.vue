<template>
    <div class="mt-5 ml-5 flex items-center flex-wrap gap-x-10 gap-y-1">
        <div class="flex items-center space-x-2">
            <div class="rounded-full w-5 h-5" :class="isCloudConnected ? 'bg-green-500' : 'bg-red-500'" />
            <div>{{ isCloudConnected ? "CLOUD CONNECTED" : "CLOUD DISCONNECTED" }}</div>
        </div>
        <div class="flex items-center space-x-2">
            <div class="rounded-full w-5 h-5" :class="isModuleConnected ? 'bg-green-500' : 'bg-red-500'" />
            <div>{{ isModuleConnected ? "MODULE CONNECTED" : "MODULE DISCONNECTED" }}</div>
        </div>
        <div class="flex items-center space-x-2 mr-4">
            <div class="space-x-2">{{ state.numOfDevices + " Device[s] Connected" }}</div>
        </div>
    </div>
    <div class="max-w-7xl mx-auto pb-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
            <div class="flex items-center h-full lg:flex-row" :class="!isCloudConnected ? 'justify-center' : ''">
                <div v-if="isCloudConnected" class="p-5 m-10 h-full bg-gray-700 mx-auto rounded-lg shadow-2xl">
                    <div class="p-4 h-full flex gap-10 justify-center flex-row flex-wrap mx-auto select-none">
                        <LightElement v-for="light in state.lightsStatus" :key="light.index" :light="light" @light-clicked="onLightClick" />
                    </div>
                    <div class="p-4">
                        <div class="bg-white rounded-lg p-4 shadow-2xl flex flex-wrap justify-center">
                            <h1 class="text-black text-2xl">Temp: {{ state.tempSensor.temperature }},&nbsp;</h1>
                            <h1 class="text-black text-2xl">Humidity: {{ state.tempSensor.humidity }}</h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- /End replace -->
    </div>
    <Modal ref="errorModal" />
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, onMounted, reactive, ref, WritableComputedRef } from "vue";
import { ActionsType, GettersType, Light, StatusType, TempSensor, ErrorType, ModalType } from "../../types";
import { useStore } from "../store/store";
import LightElement from "./LightElement.vue";
import Modal from "./Modal.vue";

const requestTimeout = 3000;

export default defineComponent({
    name: "Dashboard",
    components: {
        LightElement,
        Modal,
    },
    setup() {
        const store = useStore();
        const errorModal = ref<InstanceType<typeof Modal>>();

        const state = reactive({
            numOfDevices: 0,
            lightsStatus: Array<Light>(),
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

        const isModuleConnected: WritableComputedRef<boolean> = computed({
            get(): boolean {
                return store.getters[GettersType.isModuleConnected];
            },
            set(newValue: boolean) {
                store.dispatch(ActionsType.SetModuleConnected, newValue);
            },
        });

        function onLightClick(light: Light) {
            if (light.status == StatusType.Processing || !isModuleConnected.value) return;
            store.state.socket.emit("light-status-change-request", { index: light.index, status: light.status == StatusType.On ? StatusType.Off : StatusType.On });
            state.lightsStatus[light.index].status = StatusType.Processing;
            setTimeout(() => {
                if (state.lightsStatus[light.index].status == StatusType.Processing) {
                    errorModal.value?.open("Reuqest timeout", `Your request to change the status of Light ${light.index} to ${light.status == StatusType.On ? StatusType.Off : StatusType.On} has failed. Please check your connection to the cloud and module.`, ModalType.Error, ErrorType.RequestTimeout);
                    state.lightsStatus[light.index].status = StatusType.Off;
                }
            }, requestTimeout);
        }

        store.state.socket.on("connect", () => {
            store.state.socket.emit("set-client");

            store.state.socket.on("configure-client", () => {
                isCloudConnected.value = true;
            });

            store.state.socket.on("disconnect", () => {
                isCloudConnected.value = false;
                store.state.socket.off("configure-client");
            });
        });

        store.state.socket.on("set-lights-status", (lights: Array<Light>) => {
            state.lightsStatus.splice(0, state.lightsStatus.length);
            for (let i = 0; i < lights.length; i++) {
                state.lightsStatus.push({ index: lights[i].index, status: lights[i].status });
            }
            console.log("Lights configured");
        });

        store.state.socket.on("set-temp-status", (tempSensor: TempSensor) => {
            state.tempSensor.temperature = tempSensor.temperature === "null" ? "N/A" : tempSensor.temperature.substr(0, tempSensor.temperature.length - 4) + " °C";
            state.tempSensor.humidity = tempSensor.humidity === "null" ? "N/A" : tempSensor.humidity.substr(0, tempSensor.humidity.length - 4) + " %";
        });

        store.state.socket.on("module-connect", () => {
            isModuleConnected.value = true;
            store.state.socket.on("module-disconnect", () => {
                isModuleConnected.value = false;
            });
        });

        store.state.socket.on("set-device-count", (num) => {
            state.numOfDevices = num;
        });

        store.state.socket.on("light-status-changed", (light: Light) => {
            if (light.index >= state.lightsStatus.length) return;
            state.lightsStatus[light.index].status = light.status;
        });

        store.state.socket.on("light-pin-error", (light: Light) => {
            console.log(`Light ${light.index} with status ${light.status} failed. (Either checker pin or power pin is disconnected)`);
            errorModal.value?.open("Light failure", `Light ${light.index} has failed to change its status to ${light.status}. This either means your light pin or checker pin is disconnected.`, ModalType.Error, ErrorType.LightFailure);
        });

        return {
            store,
            state,
            isCloudConnected,
            isModuleConnected,
            onLightClick,
            StatusType,
            errorModal,
        };
    },
});
</script>
