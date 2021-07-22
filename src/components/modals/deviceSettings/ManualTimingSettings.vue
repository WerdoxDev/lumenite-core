<template>
    <div v-if="show" class="sm:flex sm:items-start sm:ml-3 mt-5 sm:mt-2">
        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <div class="mt-1">
                <div class="relative flex items-center space-x-2 z-30">
                    <h2 class="text-md text-gray-700">Type:</h2>
                    <Listbox v-model="state.selectedManualTiming" class="w-32">
                        <div class="relative">
                            <ListboxButton class="relative w-full py-2 pl-3 pr-10 text-left bg-white border rounded-lg shadow-sm cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
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
                <div v-if="state.selectedManualTiming.value === TimingType.Toggle">
                    <slot name="toggle"></slot>
                </div>
                <div v-else-if="state.selectedManualTiming.value === TimingType.Pulse">
                    <slot name="pulse"></slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { TransitionRoot, TransitionChild, Dialog, DialogOverlay, DialogTitle, Listbox, ListboxLabel, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/vue";
import { ExclamationIcon, XIcon, MenuIcon, CheckIcon, SelectorIcon } from "@heroicons/vue/outline";
import TimeSelector from "./TimeSelector.vue";
import { TimingType } from "../../../../types";

const modes = [
    { name: "Toggle", value: TimingType.Toggle },
    { name: "Pulse", value: TimingType.Pulse },
];

export default defineComponent({
    name: "ManualTimingSettings",
    components: {
        Listbox,
        ListboxButton,
        ListboxOption,
        ListboxOptions,
        CheckIcon,
        SelectorIcon,
    },
    props: {
        show: {
            type: Boolean,
            required: true,
        },
    },
    setup() {
        const state = reactive({
            selectedManualTiming: modes[0],
        });

        return {
            state,
            modes,
            TimingType,
        };
    },
});
</script>
