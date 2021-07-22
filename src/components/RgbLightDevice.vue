<template>
    <div class="w-full md:w-80 flex flex-col items-center">
        <div @click="changeLightStatus" :class="`bg-${getColor}-400`" class="animate-rgbLight-body-popup relative h-56 w-full rounded-lg shadow-2xl cursor-pointer transform hover:scale-105 hover:-translate-y-2 focus:opacity-0 transition-all">
            <div class="flex justify-center items-center flex-col h-full">
                <h1 class="text-white font-bold text-4xl">{{ state.rgbLight.name }}</h1>
                <p class="text-gray-200">{{ getStatusText }}</p>
                <transition leave-active-class="transition duration-100 ease-in" leave-to-class="opacity-0" enter-active-class="transition duration-100 ease-in" enter-from-class="opacity-0">
                    <div>
                        <div v-if="isTimerActive" class="top-5 left-5 absolute bg-blue-500 shadow-lg rounded-md p-2 text-white font-bold">{{ getFormattedTime }} | {{ StatusType[getLastStatus()].toUpperCase() }} -> {{ StatusType[getFutureStatus()].toUpperCase() }}</div>
                        <div v-if="isTimerActive" class="top-5 right-5 absolute bg-red-500 shadow-lg rounded-md p-2 text-white font-bold transform transition-all hover:scale-105" @click="cancelTimer()">Cancel</div>
                        <div class="bottom-5 left-5 absolute bg-white w-10 h-10 shadow-lg rounded-md" :style="{ background: state.colorStyle }"></div>
                    </div>
                </transition>
            </div>
        </div>
        <div v-if="state.rgbLight.isConnected" class="animate-rgbLight-footer-popup h-16 bg-white rounded-lg z-10 relative -mt-3 w-11/12">
            <div class="flex items-center w-full h-full p-3">
                <Listbox v-model="state.selectedMode" class="w-full">
                    <div class="relative mt-1">
                        <ListboxButton class="relative w-full py-2 pl-3 pr-10 text-left bg-white border rounded-lg shadow-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
                            <span class="block truncate">{{ state.selectedMode.name }}</span>
                            <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <SelectorIcon class="w-5 h-5 text-gray-400" aria-hidden="true" />
                            </span>
                        </ListboxButton>

                        <transition leave-active-class="transition duration-100 ease-in" leave-to-class="opacity-0" enter-active-class="transition duration-100 ease-in" enter-from-class="opacity-0">
                            <ListboxOptions class="absolute w-full py-1 mt-1 overflow-auto no-scrollbar text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                <ListboxOption v-slot="{ active, selected }" v-for="mode in modes" :key="mode.name" :value="mode" as="template" class="hover:bg-gray-100">
                                    <li :class="[active ? 'text-amber-900 bg-amber-100' : 'text-gray-900', 'cursor-default select-none relative py-2 pl-10 pr-4']">
                                        <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{ mode.name }}</span>
                                        <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                            <CheckIcon class="w-5 h-5" aria-hidden="true" />
                                        </span>
                                    </li>
                                </ListboxOption>
                            </ListboxOptions>
                        </transition>
                    </div>
                </Listbox>
                <CogIcon @click="openSettings" class="bg- w-8 h-8 mx-1 flex-shrink-0 transform hover:-rotate-45 transition-all text-gray-700" />
            </div>
        </div>
    </div>
    <ErrorModal ref="errorModal" class="hidden" />
    <RgbLightSettingsModal ref="rgbLightSettingsModal" class="hidden" :deviceId="deviceId" />
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, reactive, ref, onMounted, onUnmounted, watch, onUpdated } from "vue";
import { Listbox, ListboxLabel, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/vue";
import { ClientCommands, Device, DeviceStatus, emptyStatus, getMsFromTime, Light, RgbLight, RgbLightStatus, StatusType, Timer, TimingType } from "../../types";
import { CogIcon } from "@heroicons/vue/outline";
import { CheckIcon, SelectorIcon } from "@heroicons/vue/solid";
import { useStore } from "../store/store";
import RgbLightSettingsModal from "./modals/deviceSettings/RgbLightSettingsModal.vue";
import ErrorModal from "./modals/ErrorModal.vue";

const colors = { [-3]: "purple", [1]: "green", [-2]: "blue", [-1]: "yellow", [0]: "red", OFFLINE: "pink" };
const modes = [
    { name: "Toggle", value: TimingType.Toggle },
    { name: "Pulse", value: TimingType.Pulse },
];

export default defineComponent({
    name: "RgbLightDevice",
    components: {
        Listbox,
        ListboxLabel,
        ListboxButton,
        ListboxOptions,
        ListboxOption,
        CheckIcon,
        SelectorIcon,
        CogIcon,
        RgbLightSettingsModal,
        ErrorModal,
    },
    props: {
        deviceId: Number,
    },
    setup(props) {
        const store = useStore();

        const errorModal = ref<InstanceType<typeof ErrorModal>>();
        const rgbLightSettingsModal = ref<InstanceType<typeof RgbLightSettingsModal>>();

        const state = reactive({
            selectedMode: modes[0],
            rgbLight: store.state.devices.find((x) => x.id === props.deviceId) as RgbLight,
            colorStyle: "",
        });

        var timeout;

        watch(store.state.devices, (newValue, oldValue) => {
            state.rgbLight = newValue.find((x) => x.id === props.deviceId) as RgbLight;
            state.colorStyle = `rgb(${255 - state.rgbLight.status.redValue},${255 - state.rgbLight.status.greenValue},${255 - state.rgbLight.status.blueValue})`;
        });

        const getColor: ComputedRef<string> = computed(() => {
            if (!state.rgbLight.isConnected) return colors["OFFLINE"];
            return colors[getCurrentStatus()];
        });

        const getStatusText: ComputedRef<string> = computed(() => {
            if (!state.rgbLight.isConnected) return "OFFLINE";
            if (getCurrentStatus() === StatusType.Processing) return StatusType[getCurrentStatus()].toUpperCase() + "...";
            return StatusType[getCurrentStatus()].toString().toUpperCase();
        });

        const isTimerActive: ComputedRef<boolean> = computed(() => {
            return state.rgbLight.settings.timer?.timeLeft ? true : false;
        });

        const getFormattedTime: ComputedRef<string> = computed(() => {
            if (state.rgbLight.settings.timer?.timeLeft) {
                var timer = state.rgbLight.settings.timer.timeLeft;
                return (timer.hour >= 10 ? timer.hour.toString() : "0" + timer.hour.toString()) + ":" + (timer.minute >= 10 ? timer.minute.toString() : "0" + timer.minute.toString()) + ":" + (timer.second >= 10 ? timer.second.toString() : "0" + timer.second.toString());
            }
            return "00:00:00";
        });

        function changeLightStatus() {
            if (!isInValidState()) return;
            state.rgbLight.status.futureStatus = getOppositeStatus(getCurrentStatus());
            state.rgbLight.status.lastStatus = getCurrentStatus();
            state.rgbLight.status.currentStatus = StatusType.Processing;
            //console.log(state.rgbLight.status.redValue);
            store.state.socket.emit(ClientCommands.ChangeDeviceStatus, state.rgbLight, state.selectedMode.value);
            timeout = setTimeout(() => {
                if (getCurrentStatus() === StatusType.Processing) {
                    errorModal.value?.open("Device Status Timeout", `Your request to change the status of (${state.rgbLight.name}) from ${StatusType[getLastStatus()].toUpperCase()} to ${StatusType[getFutureStatus()].toUpperCase()} has Timed out. Please check your connection to the internet`);
                    state.rgbLight.status.currentStatus = state.rgbLight.status.lastStatus;
                }
            }, getMsFromTime(state.rgbLight.settings.timeoutTime));
        }

        function isInValidState() {
            return getCurrentStatus() !== StatusType.Processing && getCurrentStatus() !== StatusType.Waiting && getCurrentStatus() !== StatusType.None;
        }

        function openSettings() {
            rgbLightSettingsModal.value?.open();
        }

        function getFutureStatus(): StatusType {
            return state.rgbLight.status.futureStatus;
        }

        function getCurrentStatus(): StatusType {
            return state.rgbLight.status.currentStatus;
        }

        function getLastStatus(): StatusType {
            return state.rgbLight.status.lastStatus;
        }

        function getOppositeStatus(status: StatusType): StatusType {
            return status == StatusType.On ? StatusType.Off : StatusType.On;
        }

        onMounted(() => {
            store.state.socket.on(ClientCommands.DeviceStatusChanged, (device: Device) => {
                if (device.id !== props.deviceId) return;
                if ((device.status as RgbLightStatus) == null) return;
                state.rgbLight.status = device.status as RgbLightStatus;
                //console.log(state.rgbLight.status.redValue);
                clearTimeout(timeout);
            });
            store.state.socket.on(ClientCommands.SetTimer, (deviceId: number, timer: Timer) => {
                if (deviceId !== props.deviceId) return;
                state.rgbLight.settings.timer = timer;
            });
            store.state.socket.on(ClientCommands.DevicePinError, (device: Device) => {
                if (device.id !== props.deviceId) return;
                errorModal.value?.open("Device Pin Error", `Your device (${device.name}) Failed to change its status from ${StatusType[device.status.lastStatus].toUpperCase()} to ${StatusType[device.status.futureStatus].toUpperCase()}. This either means the physical pin / pinCheck is disconnected`);
                state.rgbLight.status.currentStatus = device.status.lastStatus;
            });

            state.colorStyle = `rgb(${255 - state.rgbLight.status.redValue},${255 - state.rgbLight.status.greenValue},${255 - state.rgbLight.status.blueValue})`;
        });

        onUnmounted(() => {
            store.state.socket.off(ClientCommands.DeviceStatusChanged);
            store.state.socket.off(ClientCommands.DevicePinError);
            store.state.socket.off(ClientCommands.SetTimer);
        });

        function cancelTimer() {
            store.state.socket.emit(ClientCommands.SetTimer, state.rgbLight.id, undefined);
        }

        return {
            state,
            StatusType,
            getColor,
            getStatusText,
            getFormattedTime,
            isTimerActive,
            changeLightStatus,
            openSettings,
            cancelTimer,
            getFutureStatus,
            getLastStatus,
            getCurrentStatus,
            getOppositeStatus,
            modes,
            rgbLightSettingsModal,
            errorModal,
        };
    },
});
</script>