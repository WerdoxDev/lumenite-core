<template>
    <div v-if="show" class="sm:flex sm:items-start sm:ml-3 mt-5 sm:mt-2">
        <div class="mt-3 sm:mt-0 sm:ml-4 text-left w-full">
            <div class="mt-1">
                <div class="flex items-center">
                    <h2 class="text-md text-gray-700 w-full">Your events:</h2>
                    <PlusCircleIcon class="w-9 h-9 text-green-500 flex-shrink-0 cursor-pointer hover:text-green-700" @click="$emit('create')" />
                </div>
                <div v-if="state.timings.length > 0" class="relative flex items-center flex-col space-y-2 mt-2 max-h-60 md:max-h-40 overflow-y-scroll no-scrollbar">
                    <div v-for="timing in state.timings" :key="timing.id" class="w-full bg-pink-400 rounded-lg shadow-md px-2 py-1 text-white">
                        <div class="flex space-x-2">
                            <div class="w-full">{{ timing.name }}</div>
                            <PencilIcon class="w-5 h-5 text-white flex-shrink-0 cursor-pointer hover:text-gray-200" @click="edit(timing)" />
                            <TrashIcon class="w-5 h-5 text-white flex-shrink-0 cursor-pointer hover:text-gray-200" @click="remove(timing)" />
                        </div>
                    </div>
                </div>
                <div v-else>
                    <span>You don't have any events yet!</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive } from "vue";
import { PlusCircleIcon, PencilIcon, TrashIcon } from "@heroicons/vue/solid";
import Modal from "../Modal.vue";
import { AutomaticTiming, AutomaticTimings } from "../../../../types";

export default defineComponent({
    name: "AutomaticTimingSettings",
    components: {
        PlusCircleIcon,
        PencilIcon,
        TrashIcon,
        Modal,
    },
    props: {
        show: {
            type: Boolean,
            required: true,
        },
        timings: {
            type: Object as PropType<AutomaticTimings>,
            required: true,
        },
    },
    emits: ["create", "update:timings"],
    setup(props, { emit }) {
        const state = reactive({
            timings: props.timings,
        });

        function edit(timing: AutomaticTiming) {}

        function remove(timing: AutomaticTiming) {
            var index = state.timings.findIndex((x) => x.id === timing.id);
            state.timings.splice(index, 1);
            emit("update:timings", state.timings);
        }

        return {
            edit,
            remove,
            state,
        };
    },
});
</script>
