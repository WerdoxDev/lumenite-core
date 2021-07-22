<template>
    <Modal :show="state.modal.isOpen" @close="state.modal.isOpen = false">
        <div v-if="!state.isAutomaticMenuOpen">
            <SettingsSideover title="Rgb Light Settings" :menus="menus" :selected="state.selectedMenu" :show="state.isSideoverOpen" @select-menu="selectMenu" @close="state.isSideoverOpen = false" />
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 sm:flex sm:divide-x-2 rounded-lg rounded-b-none">
                <div class="mr-5 hidden sm:block flex-shrink-0">
                    <div class="flex flex-col">
                        <div v-for="menu in menus" :key="menu.id">
                            <h2 v-if="menu.isHeader" class="font-bold text-xl mb-2">{{ menu.name }}</h2>
                            <button v-else class="rounded-lg p-1 mb-1 ml-1 hover:bg-gray-200" :class="menu.id === state.selectedMenu.id ? 'bg-gray-200' : ''" @click="selectMenu(menu)">
                                <div class="ml-2 mr-2 text-lg text-left">{{ menu.name }}</div>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="w-full">
                    <ModalTitle :text="state.selectedMenu.name" @open="state.isSideoverOpen = true" />
                    <ManualTimingSettings :show="state.selectedMenu.id === 1">
                        <template v-slot:toggle>
                            <TimeSelector text="Delay:" class="z-20" v-model:data="state.settings.manualTimings[2]" />
                        </template>
                        <template v-slot:pulse>
                            <TimeSelector text="Delay:" class="z-10" v-model:data="state.settings.manualTimings[0]" />
                            <TimeSelector text="Timeout:" v-model:data="state.settings.manualTimings[1]" />
                        </template>
                    </ManualTimingSettings>
                    <AutomaticTimingSettings :show="state.selectedMenu.id === 2" @create="state.isAutomaticMenuOpen = true" v-model:timings="state.settings.automaticTimings" />
                </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse items-center rounded-lg rounded-t-none">
                <button type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm" @click="submit()">Save</button>
                <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" @click="state.modal.isOpen = false">Cancel</button>
            </div>
        </div>
        <div v-else>
            <CreateAutomatic v-if="state.isAutomaticTimeOpen" @back="state.isAutomaticMenuOpen = false" @submit="automaticSubmit" />
            <AutomaticTimeSelector />
        </div>
    </Modal>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive } from "vue";
import { TransitionRoot, TransitionChild, Dialog, DialogOverlay, DialogTitle, Listbox, ListboxLabel, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/vue";
import { ExclamationIcon, XIcon, MenuIcon, CheckIcon, SelectorIcon } from "@heroicons/vue/outline";
import { BasicDevice, BasicSettings, ClientCommands, ModalState, ManualTimingType, getTimeFromMs, SettingsModalMenu, AutomaticTimings, AutomaticTiming } from "../../../../types";
import TimeSelector from "./TimeSelector.vue";
import Modal from "../Modal.vue";
import SettingsSideover from "../SettingsSideover.vue";
import ModalTitle from "../ModalTitle.vue";
import ManualTimingSettings from "./ManualTimingSettings.vue";
import AutomaticTimingSettings from "./AutomaticTimingSettings.vue";
import AutomaticTimeSelector from "../AutomaticTimeSelector.vue";
import CreateAutomatic from "../CreateAutomatic.vue";
import { useStore } from "../../../store/store";

const menus: Array<SettingsModalMenu> = [
    { id: 0, name: "Actions", isHeader: true },
    { id: 1, name: "Manual Settings", isHeader: false },
    // { id: 2, name: "Automatic Settings", isHeader: false },
];

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
        Modal,
        SettingsSideover,
        ModalTitle,
        ManualTimingSettings,
        AutomaticTimingSettings,
        CreateAutomatic,
        AutomaticTimeSelector,
    },
    props: {
        deviceId: Number,
    },
    setup(props) {
        //const ;
        const store = useStore();
        const state = reactive({
            modal: { isOpen: false } as ModalState,
            isSideoverOpen: false,
            isAutomaticMenuOpen: false,
            isAutomaticTimeOpen: false,
            test: false,
            selectedMenu: menus[1],
            settings: store.state.devices.find((x) => x.id === props.deviceId)?.settings as BasicSettings,
        });

        function open() {
            state.modal.isOpen = true;
        }

        function close() {
            state.modal.isOpen = false;
        }

        function submit() {
            state.modal.isOpen = false;

            //Change timeoutTime to be set from this modal it self
            var newSettings: BasicSettings = { manualTimings: state.settings.manualTimings, automaticTimings: state.settings.automaticTimings, timeoutTime: getTimeFromMs(3000) };
            var device = store.state.devices.find((x) => x.id === props.deviceId) || store.state.devices[0];
            device.settings = newSettings;
            store.state.socket.emit(ClientCommands.ChangeDeviceSettings, device);
        }

        function selectMenu(menu: SettingsModalMenu) {
            state.selectedMenu = menu;
            state.isSideoverOpen = false;
        }

        function automaticSubmit(timing: AutomaticTiming) {
            state.isAutomaticMenuOpen = false;
            console.log(timing);
            timing.id = state.settings.automaticTimings.length;
            state.settings.automaticTimings.push(timing);
            state.isAutomaticTimeOpen = true;
        }

        onMounted(() => {
            store.state.socket.on(ClientCommands.DeviceSettingsChanged, (device: BasicDevice) => {
                if (device.id !== props.deviceId) return;
                state.settings = device.settings;
            });
        });

        return {
            state,
            open,
            close,
            submit,
            selectMenu,
            automaticSubmit,
            ManualTimingType,
            menus,
        };
    },
});
</script>
