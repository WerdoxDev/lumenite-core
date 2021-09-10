<template>
    <div class="w-full md:w-max flex flex-col items-center" style="max-width: 200px">
        <div @click="changeDeviceStatus()" :class="`bg-${getColor(1)}-400`" class="animate-device-body-popup relative h-max w-full rounded-lg shadow-md cursor-pointer transform hover:scale-105 transition-all">
            <div class="flex justify-center flex-col h-full">
                <div class="rounded-lg rounded-tl-none rounded-br-none py-2 px-8 shadow-md mx-2 mt-2 transition-all" :class="`bg-${getColor(1)}-300`">
                    <h1 class="text-white text-center font-bold text-3xl">{{ state.device.name }}</h1>
                </div>
                <div class="flex items-center justify-between mb-2 mt-4">
                    <div :class="`bg-${getColor(1)}-500`" class="transition-all group px-2 h-10 rounded-lg rounded-l-none flex justify-center items-center shadow-md">
                        <p class="text-center text-white font-bold">{{ getStatusText }}</p>
                    </div>
                    <div @click.stop="openSettings()" :class="`bg-${getColor(1)}-500`" class="h-10 px-2 rounded-lg group rounded-r-none flex justify-center items-center shadow-md transition-all transform hover:pr-4">
                        <CogIcon class="w-7 h-7 text-white transition-all transform group-hover:rotate-90" />
                    </div>
                </div>
            </div>
            <!-- <transition leave-active-class="transition duration-100 ease-in" leave-to-class="opacity-0" enter-active-class="transition duration-100 ease-in" enter-from-class="opacity-0">
                <div v-if="isTimerActive" class="absolute left-0 top-0 w-4 h-56 rounded-lg rounded-r-none cursor-pointer shadow-md-r" :class="`bg-${getColor(2)}-400`"></div>
            </transition> -->
        </div>
    </div>
    <ErrorModal ref="errorModal" class="hidden"></ErrorModal>
    <OutputSettingsModal ref="deviceSettingsModal" class="hidden" :deviceId="deviceId" />
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, reactive, ref, onMounted, watch, onUnmounted } from "vue";
import { Listbox, ListboxLabel, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/vue";
import { checkTopic, Command, CommandType, emptyStatus, getMsFromTime, getTimeFromMs, parseJson, Status, StatusType } from "../../types";
import { CogIcon } from "@heroicons/vue/outline";
import { CheckIcon, SelectorIcon } from "@heroicons/vue/solid";
import OutputSettingsModal from "./modals/deviceSettings/OutputSettingsModal.vue";
import ErrorModal from "./modals/ErrorModal.vue";
import { OutputDeviceClass } from "../../classes";
import { store } from "../store/store";

// -4: None, -3: Offline, -2: Waiting, -1: Processing, 0: Off, 1: On
const colors = { [-4]: "purple", [-3]: "pink", [-2]: "blue", [-1]: "yellow", [0]: "red", [1]: "green" };

export default defineComponent({
    components: {
        Listbox,
        ListboxLabel,
        ListboxButton,
        ListboxOptions,
        ListboxOption,
        CheckIcon,
        SelectorIcon,
        CogIcon,
        OutputSettingsModal,
        ErrorModal,
    },
    props: {
        deviceId: Number,
    },
    setup(props) {
        const errorModal = ref<InstanceType<typeof ErrorModal>>();
        const deviceSettingsModal = ref<InstanceType<typeof OutputSettingsModal>>();

        const state = reactive({
            device: store.state.devices.find((x) => x.id === props.deviceId) as OutputDeviceClass,
        });

        var timeout;

        const getStatusText: ComputedRef<string> = computed(() => {
            return StatusType[state.device.currentStatus.power].toString().toUpperCase();
        });

        watch(store.state.devices.find((x) => x.id === props.deviceId) || store.state.devices[0], (newValue, oldValue) => {
            state.device = newValue;
            console.log("UPDATE");
        });

        function getColor(index) {
            if (index === 0) return colors[state.device.futureStatus.power];
            else if (index === 1) return colors[state.device.currentStatus.power];
            else if (index === 2) return colors[state.device.lastStatus.power];
        }

        function changeDeviceStatus() {
            state.device.setStatus(state.device.oppositeStatus(state.device.currentStatus), { power: StatusType.Processing }, state.device.currentStatus);

            // store.state.socket.emit(ClientCommands.ChangeDeviceStatus, state.device, state.timingId.value);
            if (timeout !== 0) return;
            timeout = setTimeout(() => {
                if (state.device.currentStatus.power === StatusType.Processing && timeout !== -1) {
                    errorModal.value?.open("Device Status Timeout", `Your request to change the status of (${state.device.name}) from ${StatusType[state.device.lastStatus.power].toUpperCase()} to ${StatusType[state.device.futureStatus.power].toUpperCase()} has Timed out. Please check your connection to the internet`);
                    state.device.currentStatus = state.device.lastStatus || emptyStatus();
                }
            }, state.device.settings.timeoutTime);
        }

        function openSettings() {
            console.log("HELLO");
            deviceSettingsModal.value?.open();
        }

        onMounted(() => {
            store.state.mqtt?.on("message", (topic, message) => {
                if (checkTopic(topic, `module/${state.device.config.moduleToken}/execute-client-command`)) {
                    var command: Command = parseJson(message.toString());
                    if (command.deviceId !== state.device.id) return;
                    if (!state.device.config.validCommands.find((x) => x === command.id)) {
                        console.log("Command is not valid");
                        return;
                    }
                    if (command.id === CommandType.PowerChanged) {
                        if (!state.device.status) return;
                        state.device.status!.currentStatus.power = (parseJson(command.payload[0]) as Status).power;
                        clearTimeout(timeout);
                    }
                }
            });
            // setTimeout(() => {
            //     if (state.device.id % 3 === 0) state.device.status = { currentStatus: StatusType.Processing, futureStatus: StatusType.None, lastStatus: StatusType.None };
            //     else if (state.device.id % 2 === 0) state.device.status = { currentStatus: StatusType.On, futureStatus: StatusType.None, lastStatus: StatusType.None };
            //     else state.device.status = { currentStatus: StatusType.Off, futureStatus: StatusType.None, lastStatus: StatusType.None };
            // }, 1000);
            // store.state.socket.on(ClientCommands.DeviceStatusChanged, (device: Device) => {
            //     if (device.id !== props.deviceId) return;
            //     state.device.status = device.status;
            //     clearTimeout(timeout);
            // });
            // store.state.socket.on(ClientCommands.SetTimer, (deviceId: number, timer: Timer) => {
            //     if (deviceId !== props.deviceId) return;
            //     state.device.settings.timer = timer;
            // });
            // store.state.socket.on(ClientCommands.DevicePinError, (device: Device) => {
            //     if (device.id !== props.deviceId) return;
            //     errorModal.value?.open("Device Pin Error", `Your device (${device.name}) Failed to change its status from ${StatusType[device.status.lastStatus].toUpperCase()} to ${StatusType[device.status.futureStatus].toUpperCase()}. This either means the physical pin / pinCheck is disconnected`);
            //     state.device.status.currentStats = device.status.lastStatus;
            // });u
        });

        return {
            state,
            StatusType,
            getColor,
            getStatusText,
            changeDeviceStatus,
            openSettings,
            deviceSettingsModal,
            errorModal,
        };
    },
});
</script>