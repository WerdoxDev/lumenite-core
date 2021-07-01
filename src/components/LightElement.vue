<template>
    <div class="w-full md:w-80 flex flex-col items-center">
        <div @click="onLightClick" :class="`bg-${getColor}-400`" class="animate-light-body-popup relative h-56 w-full rounded-lg shadow-2xl cursor-pointer transform hover:scale-105 hover:-translate-y-2 focus:opacity-0 transition-all">
            <div class="flex h-full justify-center items-center flex-col">
                <h1 class="text-white font-semibold text-4xl">Light {{ light.index + 1 }}</h1>
                <p class="text-gray-200">{{ light.status == StatusType.PROCESSING ? light.status + "..." : light.status }}</p>
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
                            <ListboxOptions class="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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
                <CogIcon class="w-8 h-8 mx-1 flex-shrink-0 transform hover:-rotate-45 transition-all text-gray-700" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, PropType, reactive } from "vue";
import { Light, StatusType } from "../../types";
import { Listbox, ListboxLabel, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/vue";
import { CogIcon } from "@heroicons/vue/outline";
import { CheckIcon, SelectorIcon } from "@heroicons/vue/solid";

const colors = { ON: "green", PROCESSING: "yellow", OFF: "red" };
const modes = [{ name: "Toggle" }, { name: "Timer (Duration)" }, { name: "Timer (From / To)" }];

export default defineComponent({
    name: "LightElement",
    components: {
        Listbox,
        ListboxLabel,
        ListboxButton,
        ListboxOptions,
        ListboxOption,
        CheckIcon,
        SelectorIcon,
        CogIcon,
    },
    emits: ["light-clicked"],
    props: {
        light: {
            type: Object as PropType<Light>,
            required: true,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            isShowing: true,
            selectedMode: modes[0],
        });

        const getColor: ComputedRef<string> = computed(() => {
            return colors[props.light.status];
        });

        function onLightClick() {
            if (props.light.status == StatusType.Processing) return;
            emit("light-clicked", props.light);
            state.isShowing = false;
            setTimeout(() => {
                state.isShowing = true;
            }, 500);
        }

        return {
            state,
            StatusType,
            getColor,
            onLightClick,
            modes,
        };
    },
});
</script>
