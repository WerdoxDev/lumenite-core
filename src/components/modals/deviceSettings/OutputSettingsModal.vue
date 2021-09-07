<template>
    <Modal :show="state.isOpen" @close="state.isOpen = false">
        <!-- <div v-if="!state.isAutomaticMenuOpen"> -->
        <SettingsSideover title="Output Device Settings" :menus="menus" :selected="state.selectedMenu" :show="state.isSideoverOpen" @select-menu="selectMenu" @close="state.isSideoverOpen = false" />
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 sm:flex sm:divide-x-2 rounded-lg rounded-b-none">
            <div class="pr-5 hidden sm:block flex-shrink-0">
                <div class="flex flex-col">
                    <div v-for="menu in menus" :key="menu.id">
                        <p v-if="menu.isHeader" class="text-gray-800 font-bold text-lg mb-1">{{ menu.text }}</p>
                        <button v-else class="rounded-lg p-1 mb-1 ml-1 hover:bg-gray-300" :class="menu.id === state.selectedMenu.id ? 'bg-gray-200' : ''" @click="selectMenu(menu)">
                            <div class="text-gray-800 ml-2 mr-2 text-md text-left">{{ menu.text }}</div>
                        </button>
                    </div>
                </div>
            </div>
            <div class="pl-0 sm:pl-5 w-full">
                <ModalTitle :text="state.selectedMenu.text" @open="state.isSideoverOpen = true" />
                <SequenceSettings v-if="state.selectedMenu.id === 1" />
                <!-- <AutomaticTimingSettings :show="state.selectedMenu.id === 2" @create="state.isAutomaticMenuOpen = true" v-model:timings="state.settings.automaticTimings" /> -->
            </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse items-center rounded-lg rounded-t-none">
            <button type="button" class="w-full rounded-lg border border-transparent shadow-lg px-4 py-2 bg-green-600 font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm" @click="submit()">Save</button>
            <button type="button" class="mt-3 w-full rounded-lg border border-gray-300 shadow-lg px-4 py-2 bg-white font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" @click="state.isOpen = false">Cancel</button>
        </div>
        <!-- <div v-else> -->
        <!-- <CreateAutomatic v-if="state.isAutomaticTimeOpen" @back="state.isAutomaticMenuOpen = false" @submit="automaticSubmit" /> -->
        <!-- <AutomaticTimeSelector /> -->
        <!-- </div> -->
    </Modal>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, reactive } from "vue";
import { TransitionRoot, TransitionChild, Dialog, DialogOverlay, DialogTitle, Listbox, ListboxLabel, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/vue";
import { ExclamationIcon, XIcon, MenuIcon, CheckIcon, SelectorIcon } from "@heroicons/vue/outline";
import { OutputDevice, OutputSettings, getTimeFromMs, AutomaticTimings, AutomaticTiming, checkTopic, parseJson, stringJson, ModuleDeviceSettingsPayload, SettingsModalMenu } from "../../../../types";
// import TimeSelector from "./TimeSelector.vue";
import Modal from "../Modal.vue";
import SettingsSideover from "../SettingsSideover.vue";
import ModalTitle from "../ModalTitle.vue";
import AutomaticTimingSettings from "./AutomaticTimingSettings.vue";
import AutomaticTimeSelector from "../AutomaticTimeSelector.vue";
import CreateAutomatic from "../CreateAutomatic.vue";
import SequenceSettings from "../SequenceSettings.vue";
import { store } from "../../../store/store";

const menus: Array<SettingsModalMenu> = [
    { id: 0, text: "Actions", isHeader: true },
    { id: 1, text: "Sequence", isHeader: false },
    { id: 2, text: "Mamad", isHeader: true },
    { id: 3, text: "Sequence2", isHeader: false },
];

export default defineComponent({
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
        Modal,
        SettingsSideover,
        ModalTitle,
        AutomaticTimingSettings,
        CreateAutomatic,
        AutomaticTimeSelector,
        SequenceSettings,
    },
    props: {
        deviceId: Number,
    },
    setup(props) {
        const state = reactive({
            isOpen: false,
            isSideoverOpen: false,
            isAutomaticMenuOpen: false,
            isAutomaticTimeOpen: false,
            selectedMenu: menus[1],
            settings: store.state.devices.find((x) => x.id === props.deviceId)?.settings as OutputSettings,
        });

        function open() {
            state.isOpen = true;
            console.log("open");
        }

        function close() {
            state.isOpen = false;
        }

        function submit() {
            state.isOpen = false;
            //Change timeoutTime to be set from this modal it self
            var newSettings: OutputSettings = { automaticTimings: state.settings.automaticTimings, timeoutTime: 3000 };
            var device = store.state.devices.find((x) => x.id === props.deviceId) || store.state.devices[0];
            device.settings = newSettings;
            store.state.mqtt?.publish(`client/${store.state.id}/change-device-settings`, stringJson(device));
        }

        function selectMenu(menu: SettingsModalMenu) {
            state.selectedMenu = menu;
            state.isSideoverOpen = false;
        }

        function automaticSubmit(timing: AutomaticTiming) {
            state.isAutomaticMenuOpen = false;
            timing.id = state.settings.automaticTimings.length;
            state.settings.automaticTimings.push(timing);
            state.isAutomaticTimeOpen = true;
        }

        onMounted(() => {
            store.state.mqtt?.on("message", (topic, message) => {
                if (checkTopic(topic, `module/device-settings-changed`, 1)) {
                    var payload: ModuleDeviceSettingsPayload = parseJson(message.toString());
                    if (payload.id !== props.deviceId) return;
                    state.settings = Object.assign(payload.settings, state.settings);
                    console.log(state.settings);
                    console.log("here");
                }
            });
        });

        return {
            state,
            open,
            close,
            submit,
            selectMenu,
            automaticSubmit,
            menus,
        };
    },
});
</script>
