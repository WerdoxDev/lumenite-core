<template>
    <TransitionRoot :show="state.modal.isOpen">
        <Dialog as="div" static class="fixed z-10 inset-0 overflow-y-auto" @close="state.modal.isOpen = false" :open="state.modal.isOpen">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
                    <DialogOverlay class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </TransitionChild>

                <!-- This element is to trick the browser into centering the modal contents. -->
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                    <div class="inline-block align-bottom bg-white text-left rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        <TransitionRoot as="template" :show="state.isSideoverOpen">
                            <Dialog as="div" static class="z-50 fixed inset-0 overflow-hidden" @close="state.isSideoverOpen = false" :open="state.isSideoverOpen">
                                <div class="absolute inset-0 overflow-hidden">
                                    <TransitionChild as="template" enter="ease-in-out duration-500" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in-out duration-500" leave-from="opacity-100" leave-to="opacity-0">
                                        <DialogOverlay class="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                                    </TransitionChild>
                                    <div class="fixed inset-y-0 left-0 max-w-full flex">
                                        <TransitionChild as="template" enter="transform transition ease-in-out duration-500 sm:duration-700" enter-from="-translate-x-full" enter-to="translate-x-0" leave="transform transition ease-in-out duration-500 sm:duration-700" leave-from="translate-x-0" leave-to="-translate-x-full">
                                            <div class="relative w-max">
                                                <TransitionChild as="template" enter="ease-in-out duration-500" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in-out duration-500" leave-from="opacity-100" leave-to="opacity-0">
                                                    <div class="absolute top-5 -right-12 flex bg-gray-800 rounded-lg p-1 hover:bg-gray-700">
                                                        <button class="rounded-md text-white focus:outline-none hover:text-gray-300" @click="state.isSideoverOpen = false">
                                                            <span class="sr-only">Close panel</span>
                                                            <XIcon class="h-6 w-6" />
                                                        </button>
                                                    </div>
                                                </TransitionChild>
                                                <div class="h-full flex flex-col py-6 bg-white shadow-xl">
                                                    <div class="px-4 sm:px-6">
                                                        <DialogTitle class="text-2xl font-medium text-gray-900"> Light settings </DialogTitle>
                                                    </div>
                                                    <div class="mt-6 relative flex-1 px-4 sm:px-6">
                                                        <div class="absolute inset-0 px-4 sm:px-6">
                                                            <div class="flex flex-col">
                                                                <h2 class="font-bold text-xl mb-2">Actions</h2>
                                                                <button class="rounded-lg p-1 mb-1 ml-1 hover:bg-gray-200 focus:bg-gray-200 bg-gray-200">
                                                                    <div class="ml-2 mr-2 text-lg text-left">Manual</div>
                                                                </button>
                                                                <button class="rounded-lg p-1 mb-1 ml-1 hover:bg-gray-200 focus:bg-gray-200">
                                                                    <div class="ml-2 mr-2 text-lg text-left">Automatic</div>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </TransitionChild>
                                    </div>
                                </div>
                            </Dialog>
                        </TransitionRoot>
                        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 sm:flex sm:divide-x-2 rounded-lg rounded-b-none">
                            <div class="mr-5 hidden sm:block">
                                <div class="flex flex-col">
                                    <h2 class="font-bold text-xl mb-2">Actions</h2>
                                    <button class="rounded-lg p-1 mb-1 ml-1 hover:bg-gray-200 focus:bg-gray-200 bg-gray-200">
                                        <div class="ml-2 mr-2 text-lg text-left">Manual</div>
                                    </button>
                                    <button class="rounded-lg p-1 mb-1 ml-1 hover:bg-gray-200 focus:bg-gray-200">
                                        <div class="ml-2 mr-2 text-lg text-left">Automatic</div>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <div class="flex items-center divide-gray-300 divide-x-2 sm:divide-x-0">
                                    <div @click="state.isSideoverOpen = true" class="cursor-pointer sm:hidden mr-3 bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-300 hover:bg-gray-700">
                                        <MenuIcon class="block h-6 w-6 mr-2" />
                                        <span>Menu</span>
                                    </div>
                                    <div class="font-bold text-md pl-2 sm:pl-0 sm:ml-5">Manual Settings</div>
                                </div>
                                <div class="sm:flex sm:items-start sm:ml-3 mt-5 sm:mt-2">
                                    <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <div class="mt-1">
                                            <div class="relative flex items-center space-x-2 z-30">
                                                <h2 class="text-md text-gray-700">Type:</h2>
                                                <Listbox v-model="state.selectedManualTiming" class="w-32">
                                                    <div class="relative">
                                                        <ListboxButton class="relative w-full py-2 pl-3 pr-10 text-left bg-white border rounded-lg shadow-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
                                                            <span class="block truncate">{{ state.selectedManualTiming.name }}</span>
                                                            <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                                                <SelectorIcon class="w-5 h-5 text-gray-400" aria-hidden="true" />
                                                            </span>
                                                        </ListboxButton>

                                                        <transition leave-active-class="transition duration-100 ease-in" leave-to-class="opacity-0" enter-active-class="transition duration-100 ease-in" enter-from-class="opacity-0">
                                                            <ListboxOptions class="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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
                                            </div>
                                            <TimeSelector v-if="state.selectedManualTiming.name === modes[0].name" text="Delay:" class="z-20" :afterChange="ManualTimingType.ToggleDelay" />
                                            <TimeSelector v-if="state.selectedManualTiming.name === modes[1].name" text="Delay:" class="z-10" :afterChange="ManualTimingType.PulseDelay" />
                                            <TimeSelector v-if="state.selectedManualTiming.name === modes[1].name" text="Timeout:" :afterChange="ManualTimingType.PulseTimeout" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse items-center rounded-lg rounded-t-none">
                            <button type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm" @click="submit()">Save</button>
                            <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" @click="state.modal.isOpen = false">Cancel</button>
                        </div>
                    </div>
                </TransitionChild>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, watch } from "vue";
import { TransitionRoot, TransitionChild, Dialog, DialogOverlay, DialogTitle, Listbox, ListboxLabel, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/vue";
import { ExclamationIcon, XIcon, MenuIcon, CheckIcon, SelectorIcon } from "@heroicons/vue/outline";
import { BasicDevice, BasicSettings, ClientCommands, emptyTime, Light, ModalState, StatusType, ManualTimingType, GettersType, ActionsType, ManualTimingPayload, ManualTimings, emptySettings, getTimeFromMs } from "../../../../types";
import TimeSelector from "./TimeSelector.vue";
import { useStore } from "../../../store/store";

const modes = [{ name: "Toggle" }, { name: "Pulse" }];

export default defineComponent({
    name: "LightSettingsModal",
    components: {
        TransitionRoot,
        TransitionChild,
        Dialog,
        DialogOverlay,
        DialogTitle,
        Listbox,
        ListboxLabel,
        ListboxButton,
        ListboxOptions,
        ListboxOption,
        CheckIcon,
        SelectorIcon,
        ExclamationIcon,
        XIcon,
        MenuIcon,
        TimeSelector,
    },
    emits: ["submit-settings"],
    props: {
        deviceId: Number,
    },
    setup(props, { emit }) {
        const store = useStore();
        const state = reactive({
            modal: { isOpen: false } as ModalState,
            isSideoverOpen: false,
            selectedManualTiming: modes[0],
            settings: store.state.devices.find((x) => x.id === props.deviceId)?.settings,
        });

        function open() {
            var manualTiming = state.settings?.timings?.manualTimings;
            store.dispatch(ActionsType.SetManualTiming, { type: ManualTimingType.ToggleDelay, time: manualTiming?.toggleTiming?.toggleDelay } as ManualTimingPayload);
            store.dispatch(ActionsType.SetManualTiming, { type: ManualTimingType.PulseDelay, time: manualTiming?.pulseTiming?.pulseDelay } as ManualTimingPayload);
            store.dispatch(ActionsType.SetManualTiming, { type: ManualTimingType.PulseTimeout, time: manualTiming?.pulseTiming?.pulseTimeout } as ManualTimingPayload);

            state.modal.isOpen = true;
        }

        function close() {
            state.modal.isOpen = false;
        }

        function submit() {
            state.modal.isOpen = false;
            var newManualTiming = state.settings?.timings?.manualTimings || emptySettings().timings?.manualTimings;
            newManualTiming!.toggleTiming!.toggleDelay = store.getters[GettersType.GetManualTiming](ManualTimingType.ToggleDelay);
            newManualTiming!.pulseTiming!.pulseDelay = store.getters[GettersType.GetManualTiming](ManualTimingType.PulseDelay);
            newManualTiming!.pulseTiming!.pulseTimeout = store.getters[GettersType.GetManualTiming](ManualTimingType.PulseTimeout);

            //Change timeoutTime to be set from this modal it self
            var newSettings: BasicSettings = { timings: { manualTimings: newManualTiming }, timeoutTime: getTimeFromMs(3000) };
            var storeDevice = store.state.devices.find((x) => x.id === props.deviceId);
            store.state.socket.emit(ClientCommands.ChangeDeviceSettings, storeDevice, newSettings);
        }

        onMounted(() => {
            store.state.socket.on(ClientCommands.DeviceSettingsChanged, (device: BasicDevice, newSettings: BasicSettings) => {
                if (device.id !== props.deviceId) return;
                state.settings = newSettings;
            });
        });

        return {
            state,
            open,
            close,
            submit,
            modes,
            ManualTimingType,
        };
    },
});
</script>
