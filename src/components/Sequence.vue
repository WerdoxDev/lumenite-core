<template>
    <div class="h-full w-full p-5 relative flex select-none">
        <SequenceItems :items="state.items" v-model:draggingId="state.draggingId" @end="clearPreviews()" />
        <div class="flex flex-col w-full my-5 sm:ml-5">
            <div class="bg-gray-700 rounded-lg shadow-lg p-2 flex items-center flex-shrink-0">
                <p class="text-white text-lg font-bold sm:text-base">New Device Sequence #1</p>
            </div>
            <div class="shadow-lg p-3 relative h-full mx-2 rounded-lg rounded-t-none overflow-hidden">
                <div class="flex flex-col h-full space-y-2 relative" @drag="dragLeave()">
                    <div class="relative" v-for="(item, index) in state.programItems" :key="item.id">
                        <div v-if="index === 0" @drop="onDrop(index)" @dragover.prevent="dragOver(index)" class="absolute bottom-1/2 -top-1/2 w-full z-10"></div>
                        <div class="bg-white rounded-lg shadow-lg px-2 py-2 w-max h-max" :class="item.isPreview ? 'opacity-50' : ''">
                            <p>
                                {{ item.text }}
                                <span class="bg-gray-600 mx-1 py-1 px-2 rounded-lg text-white font-bold">Current Device</span>
                                to
                                <span class="bg-gray-600 ml-1 py-1 px-2 rounded-lg text-white font-bold">ON</span>
                            </p>
                        </div>
                        <div @drop="onDrop(index + 1)" @dragover.prevent="dragOver(index + 1)" class="-mb-2 absolute -bottom-1/2 top-1/2 w-full z-10"></div>
                    </div>
                    <div @drop="onDrop(state.programItems.length)" @dragover.prevent="dragOver(state.programItems.length)" class="w-full h-full z-10"></div>
                </div>
                <div class="absolute bg-gray-300 opacity-75 inset-0 -z-1" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, watch } from "vue";
import SequenceItems from "./SequenceItems.vue";
import { DeviceType, SequenceItem, SequenceProgramItem } from "../../types";
import { getDeviceSequenceItems } from "../../sequence";

export default defineComponent({
    components: {
        SequenceItems,
    },
    setup() {
        const state = reactive({
            items: getDeviceSequenceItems(DeviceType.OutputDevice),
            programItems: [] as Array<SequenceProgramItem>,
            draggingId: 0,
        });

        function onDrop(index: number) {
            const listItem = state.items.find((x) => x.id === state.draggingId);
            if (!listItem) return;
            const programItem: SequenceProgramItem = { id: state.items.length, itemId: listItem.id, text: listItem.text, isPreview: false };
            state.programItems.splice(index, 0, programItem);
            clearPreviews();
        }

        function dragOver(index: number) {
            clearPreviews();
            const listItem = state.items.find((x) => x.id === state.draggingId);
            if (listItem) {
                const programItem: SequenceProgramItem = { id: state.items.length, itemId: listItem.id, text: listItem.text, isPreview: true };
                state.programItems.splice(index, 0, programItem);
            }
        }

        function dragLeave() {
            console.log("leave");
        }

        function clearPreviews() {
            [...state.programItems].forEach((x, index) => {
                if (x.isPreview) state.programItems.splice(index, 1);
            });
        }

        return {
            state,
            DeviceType,
            onDrop,
            dragOver,
            clearPreviews,
            dragLeave,
        };
    },
});
</script>

