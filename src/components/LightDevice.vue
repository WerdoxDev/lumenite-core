<template>
    <div class="w-full md:w-80 flex flex-col items-center">
        <div @click="changeLightStatus" :class="`bg-${getColor}-400`" class="animate-light-body-popup relative h-56 w-full rounded-lg shadow-2xl cursor-pointer transform hover:scale-105 hover:-translate-y-2 focus:opacity-0 transition-all">
            <div class="flex justify-center items-center flex-col h-full">
                <h1 class="text-white font-bold text-4xl">{{ state.light.name }}</h1>
                <p class="text-gray-200">{{ getCurrentStatus() === StatusType.Processing ? getCurrentStatus() + "..." : getCurrentStatus() }}</p>
                <transition leave-active-class="transition duration-100 ease-in" leave-to-class="opacity-0" enter-active-class="transition duration-100 ease-in" enter-from-class="opacity-0">
                    <div>
                        <div v-if="isTimerActive" class="top-5 left-5 absolute bg-blue-500 shadow-lg rounded-md p-2 text-white font-bold">{{ getFormattedTime }} | {{ getLastStatus() }} -> {{ getFutureStatus() }}</div>
                        <div v-if="isTimerActive" class="top-5 right-5 absolute bg-red-500 shadow-lg rounded-md p-2 text-white font-bold transform transition-all hover:scale-105" @click="cancelTimer()">Cancel</div>
                    </div>
                </transition>
            </div>
        </div>
        <div class="animate-light-footer-popup h-16 bg-white rounded-lg z-10 relative -mt-3 w-11/12">
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
    <LightSettingsModal ref="lightSettingsModal" class="hidden" :deviceId="deviceId" />
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, reactive, ref, onMounted } from "vue";
import { Listbox, ListboxLabel, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/vue";
import { ClientCommands, Device, DeviceStatus, emptyStatus, getMsFromTime, Light, StatusType, Timer, TimingType } from "../../types";
import { CogIcon } from "@heroicons/vue/outline";
import { CheckIcon, SelectorIcon } from "@heroicons/vue/solid";
import { useStore } from "../store/store";
import LightSettingsModal from "./modals/deviceSettings/LightSettingsModal.vue";
import ErrorModal from "./modals/ErrorModal.vue";

const colors = { NONE: "purple", ON: "green", WAITING: "blue", PROCESSING: "yellow", OFF: "red" };
const modes = [
    { name: "Toggle", value: TimingType.Toggle },
    { name: "Pulse", value: TimingType.Pulse },
];

export default defineComponent({
    name: "LightDevice",
    components: {
        Listbox,
        ListboxLabel,
        ListboxButton,
        ListboxOptions,
        ListboxOption,
        CheckIcon,
        SelectorIcon,
        CogIcon,
        LightSettingsModal,
        ErrorModal,
    },
    props: {
        deviceId: Number,
    },
    setup(props) {
        const errorModal = ref<InstanceType<typeof ErrorModal>>();
        const lightSettingsModal = ref<InstanceType<typeof LightSettingsModal>>();

        const store = useStore();
        const state = reactive({
            selectedMode: modes[0],
            timerInitialStatus: StatusType.Waiting,
            light: store.state.devices.find((x) => x.id === props.deviceId) as Light,
        });

        var timeout;

        const getColor: ComputedRef<string> = computed(() => {
            return colors[getCurrentStatus()];
        });

        const isTimerActive: ComputedRef<boolean> = computed(() => {
            return state.light?.settings.timings?.timer?.timeLeft ? true : false;
        });

        const getFormattedTime: ComputedRef<string> = computed(() => {
            if (state.light?.settings.timings?.timer?.timeLeft) {
                var timer = state.light?.settings.timings.timer.timeLeft;
                return (timer.hour >= 10 ? timer.hour.toString() : "0" + timer.hour.toString()) + ":" + (timer.minute >= 10 ? timer.minute.toString() : "0" + timer.minute.toString()) + ":" + (timer.second >= 10 ? timer.second.toString() : "0" + timer.second.toString());
            }
            return "00:00:00";
        });

        function changeLightStatus() {
            if (getCurrentStatus() === StatusType.Processing || getCurrentStatus() === StatusType.Waiting || getCurrentStatus() === StatusType.None) return;
            state.light!.status.futureStatus = getOppositeStatus(getCurrentStatus());
            state.light!.status.lastStatus = getCurrentStatus();
            state.light!.status.currentStatus = StatusType.Processing;
            store.state.socket.emit(ClientCommands.ChangeDeviceStatus, state.light, state.selectedMode.value);
            timeout = setTimeout(() => {
                if (getCurrentStatus() === StatusType.Processing) {
                    errorModal.value?.open("Device Status Timeout", `Your request to change the status of (${state.light.name}) from ${getLastStatus()} to ${getFutureStatus()} has Timed out. Please check your connection to the internet`);
                    state.light.status.currentStatus = state.light.status.lastStatus;
                }
            }, getMsFromTime(state.light.settings.timeoutTime));
        }

        function openSettings() {
            // emit("settings-clicked", state.light?, state.light?Settings);
            lightSettingsModal.value?.open();
        }

        function getFutureStatus(): StatusType {
            return state.light?.status.futureStatus || emptyStatus().futureStatus;
        }

        function getCurrentStatus(): StatusType {
            return state.light?.status.currentStatus || emptyStatus().currentStatus;
        }

        function getLastStatus(): StatusType {
            return state.light?.status.lastStatus || emptyStatus().lastStatus;
        }

        function getOppositeStatus(status: StatusType): StatusType {
            return status == StatusType.On ? StatusType.Off : StatusType.On;
        }

        onMounted(() => {
            store.state.socket.on(ClientCommands.DeviceStatusChanged, (device: Device) => {
                if (device.id !== props.deviceId) return;
                //state.light!.status.lastStatus = getCurrentStatus();
                state.light!.status = device.status;
                clearTimeout(timeout);
            });
            store.state.socket.on(ClientCommands.SetTimer, (deviceId: number, timer: Timer) => {
                if (deviceId !== props.deviceId) return;
                state.light!.settings.timings!.timer = timer;
            });
            store.state.socket.on(ClientCommands.DevicePinError, (device: Device) => {
                if (device.id !== props.deviceId) return;
                errorModal.value?.open("Device Pin Error", `Your device (${device.name}) Failed to change its status from ${device.status.lastStatus} to ${device.status.futureStatus}. This either means the physical pin / pinCheck is disconnected`);
            });
        });

        function cancelTimer() {
            store.state.socket.emit(ClientCommands.SetTimer, state.light, undefined);
            var newLight: Light = { id: state.light.id, name: state.light.name, type: state.light.type, settings: state.light.settings, configuration: state.light.configuration, status: { currentStatus: getCurrentStatus(), lastStatus: getLastStatus(), futureStatus: getLastStatus() } };
            store.state.socket.emit(ClientCommands.ChangeDeviceStatus, newLight);
        }

        return {
            state,
            StatusType,
            getColor,
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
            lightSettingsModal,
            errorModal,
        };
    },
});
</script>
