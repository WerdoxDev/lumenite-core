<template>
    <div class="flex flex-wrap p-5 w-full gap-2">
        <div class="md:flex items-center flex-wrap gap-x-10 gap-y-1 p-2 rounded-lg bg-gray-700 shadow-xl h-full">
            <div class="flex items-center space-x-2">
                <div class="rounded-full w-5 h-5" :class="isCloudConnected ? 'bg-green-500' : 'bg-red-500'" />
                <div class="text-white font-bold">{{ isCloudConnected ? "CLOUD CONNECTED" : "CLOUD DISCONNECTED" }}</div>
            </div>
            <div class="flex items-center space-x-2">
                <div class="rounded-full w-5 h-5" :class="state.connectedModulesCount > 0 ? 'bg-green-500' : 'bg-red-500'" />
                <div class="text-white font-bold">{{ state.connectedModulesCount }}/{{ getUserModulesCount }} MODULES CONNECTED</div>
            </div>
            <div>
                <div class="text-white font-bold">{{ state.connectedClientsCount + " Client(s) Connected" }}</div>
            </div>
        </div>
        <CreateSequenceModal />
    </div>
    <div v-if="isCloudConnected" class="max-w-7xl mx-auto pb-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
            <div class="flex items-center justify-center h-full lg:flex-row" :class="!isCloudConnected ? 'justify-center' : ''">
                <div class="p-5 m-10 h-full bg-gray-700 rounded-lg shadow-2xl">
                    <div v-if="devices.length > 0 && state.isReady" class="p-4 h-full flex gap-10 justify-center flex-row flex-wrap select-none">
                        <OutputDeviceUI v-for="light in devices.filter((x) => x.type === DeviceType.OutputDevice)" :key="light.id" :deviceId="light.id" />
                        <!-- <RgbLightDevice v-for="rgbLight in getDevices.filter((x) => x.type === DeviceType.RgbLight)" :key="rgbLight.id" :deviceId="rgbLight.id" /> -->
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
import { computed, ComputedRef, defineComponent, onMounted, onUnmounted, reactive, WritableComputedRef } from "vue";
import { OutputDeviceClass } from "../../classes";
import { DeviceType, StatusType, OutputDevice, checkTopic, parseJson, ClientInitializePayload, ClientSetConnectedPayload, ClientSetDevicesPayload, emptyStatus } from "../../types";
import { store } from "../store/store";
import OutputDeviceUI from "./OutputDeviceUI.vue";
import CreateSequenceModal from "./modals/CreateSequenceModal.vue";

export default defineComponent({
    components: {
        OutputDeviceUI,
        CreateSequenceModal,
        //ErrorModal,
        //LightSettingsModal,
    },
    setup() {
        const state = reactive({
            connectedClientsCount: 0,
            connectedModulesCount: 0,
            isReady: false,
        });

        const isCloudConnected: WritableComputedRef<boolean> = computed({
            get(): boolean {
                return store.state.isCloudConnected;
            },
            set(newValue: boolean) {
                store.setCloudConnected(newValue);
            },
        });

        const devices: ComputedRef<Array<OutputDevice>> = computed(() => {
            return store.state.devices;
        });

        const getUserModulesCount: ComputedRef<number> = computed(() => {
            return store.state.config.registeredModuleTokens.length;
        });

        function clientInitialize(payload: ClientInitializePayload) {
            let devices: Array<OutputDeviceClass> = [];
            payload.devices.forEach((x) => {
                if (x.type === DeviceType.RgbLight) throw new Error("RgbLight is not implemented yet!");
                else {
                    let device = new OutputDeviceClass(x.id, x.name, x.type, x.status, x.config, x.settings);
                    devices.push(device);
                }
            });
            store.setDevices(devices);
            store.setConfiguration(payload.config);
            store.state.config.registeredModuleTokens.forEach((x) => {
                store.state.mqtt?.subscribe(`module/${x}/execute-client-command`);
                store.state.mqtt?.subscribe(`module/${x}/device-settings-changed`);
                store.state.mqtt?.subscribe(`module/${x}/client/${store.state.id}/set-devices`);
            });
            store.state.mqtt?.publish(`client/${store.state.id}/initialize-finished`, "");
        }

        function clientSetConnected(payload: ClientSetConnectedPayload) {
            state.connectedClientsCount = payload[0];
            state.connectedModulesCount = payload[1];
        }

        function moduleClientSetDevices(payload) {
            let devices = [...store.state.devices];
            devices.forEach((x) => {
                var index = payload.findIndex((y) => y.id === x.id);
                x.status = {
                    futureStatus: emptyStatus(),
                    currentStatus: payload[index].status?.currentStatus || emptyStatus(),
                    lastStatus: emptyStatus(),
                };
            });
            store.setDevices(devices);
        }

        onMounted(() => {
            console.log("DASHBOARD MOUNTED");
            store.setUsedLoggedIn(true);
            store.connectMqtt();
            console.log(store.state.id);
            store.state.mqtt?.subscribe(`client/${store.state.id}/set-connected`);
            store.state.mqtt?.subscribe(`client/${store.state.id}/initialize`);
            store.state.mqtt?.subscribe("server/connect");
            store.state.mqtt?.subscribe("server/offline");
            store.state.mqtt?.on("message", (topic, message) => {
                console.log(topic + ": " + message.toString());
                if (checkTopic(topic, "server/connect")) {
                    isCloudConnected.value = true;
                    store.state.mqtt?.publish(`client/connect`, store.state.id);
                } else if (checkTopic(topic, "server/offline")) {
                    isCloudConnected.value = false;
                } else if (checkTopic(topic, "client/initialize", 1)) {
                    let payload: ClientInitializePayload = parseJson(message.toString());
                    clientInitialize(payload);
                } else if (checkTopic(topic, "client/set-connected", 1)) {
                    let payload: ClientSetConnectedPayload = parseJson(message.toString());
                    clientSetConnected(payload);
                } else if (checkTopic(topic, "module/client/set-devices", 1, 3)) {
                    let payload: ClientSetDevicesPayload = parseJson(message.toString());
                    moduleClientSetDevices(payload);
                }
            });
            store.state.mqtt?.on("connect", () => {
                store.state.mqtt?.publish(`client/connect`, store.state.id);
                isCloudConnected.value = true;
            });

            store.state.mqtt?.on("offline", () => {
                console.log("bye");
            });

            state.isReady = true;
        });

        onUnmounted(() => {
            store.disconnectMqtt();
        });

        return {
            store,
            state,
            isCloudConnected,
            getUserModulesCount,
            devices,
            StatusType,
            DeviceType,
        };
    },
});
</script>