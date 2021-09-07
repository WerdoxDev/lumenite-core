<template>
    <div class="flex items-center">
        <p class="text-md text-gray-700 mr-2">{{ label }}:</p>
        <Listbox v-model="state.selectedOption" class="w-40">
            <div class="relative">
                <ListboxButton class="border relative w-full py-2 pl-3 pr-10 text-left bg-white rounded-lg shadow-lg cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
                    <span class="block truncate">{{ state.selectedOption }}</span>
                    <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <SelectorIcon class="w-5 h-5 text-gray-400" />
                    </span>
                </ListboxButton>

                <transition leave-active-class="transition duration-100 ease-in" leave-to-class="opacity-0" enter-active-class="transition duration-100 ease-in" enter-from-class="opacity-0">
                    <ListboxOptions class="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-lg shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm" :style="order ? 'z-index: ' + order * 10 : ''">
                        <ListboxOption v-slot="{ active, selected }" v-for="option in options" :key="option.id" :value="option.text" as="template" class="hover:bg-gray-100">
                            <li :class="[active ? 'bg-gray-100' : 'text-gray-900', 'crsor-default select-none relative py-2 pl-10 pr-4']">
                                <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{ option.text }}</span>
                                <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3 text-green-500">
                                    <CheckIcon class="w-5 h-5" />
                                </span>
                            </li>
                        </ListboxOption>
                    </ListboxOptions>
                </transition>
            </div>
        </Listbox>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, watch } from "vue";

import { Listbox, ListboxOptions, ListboxOption, ListboxButton } from "@headlessui/vue";
import { CheckIcon, SelectorIcon } from "@heroicons/vue/solid";
import { Option } from "../../types";

export default defineComponent({
    components: {
        Listbox,
        ListboxOptions,
        ListboxOption,
        ListboxButton,
        CheckIcon,
        SelectorIcon,
    },
    props: {
        label: {
            type: String,
            required: true,
        },
        options: {
            type: Object as PropType<Array<Option>>,
            required: true,
        },
        order: {
            type: String,
            required: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            selectedOption: props.options.find((x) => x.selected === true)?.text,
        });

        watch(state, () => {
            var options = props.options;
            options.forEach((x) => (x.selected = false));
            options.find((x) => x.text === state.selectedOption)!.selected = true;
            emit("update:options", options);
        });

        return {
            state,
        };
    },
});
</script>
