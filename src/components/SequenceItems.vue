<template>
    <div class="hidden sm:block bg-gray-700 w-64 h-full rounded-lg shadow-lg flex-shrink-0 text-center">
        <div class="bg-gray-800 w-full h-10 rounded-lg rounded-b-none flex overflow-hidden space-x-2">
            <div @click="onTabClick(tab)" v-for="tab in state.tabs" :key="tab.id" class="cursor-pointer group w-full h-full relative px-2 text-white flex items-center justify-center hover:bg-gray-700" :class="tab.selected ? 'bg-gray-700' : 'bg-gray-800'">
                <div class="group-hover:block absolute bottom-0 h-0.5 w-full" :class="`bg-${tab.color}-500 ${tab.selected ? 'block' : 'hidden'}`"></div>
                <p class="font-bold">{{ tab.text }}</p>
            </div>
        </div>
        <div class="flex flex-col space-y-2 p-3">
            <div @dragend="endDrag()" @dragstart="startDrag($event, item)" v-for="item in items.filter((x) => x.tabId === state.tabs.find((x) => x.selected).id)" :key="item.id" class="cursor-pointer py-1 w-full h-max bg-white relative rounded-lg rounded-tl-none rounded-br-none shadow-lg overflow-hidden" draggable="true">
                <div class="absolute top-0 h-1 w-full" :class="`bg-${state.tabs.find((x) => x.selected).color}-500`"></div>
                <p class="font-bold text-center text-black">{{ item.text }}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive } from "vue";
import { DeviceType, SequenceItem, SequenceItemsTab } from "../../types";
import { getDeviceSequenceItems } from "../../sequence";

export default defineComponent({
    props: {
        items: {
            type: Object as PropType<Array<SequenceItem>>,
            required: true,
        },
        draggingId: {
            type: Number,
            required: true,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            tabs: [
                { id: 0, text: "Actions", color: "green", selected: true },
                { id: 1, text: "Conditions", color: "purple", selected: false },
                { id: 2, text: "Delays", color: "yellow", selected: false },
            ] as Array<SequenceItemsTab>,
        });

        function onTabClick(tab: SequenceItemsTab) {
            state.tabs.forEach((x) => (x.selected = false));
            tab.selected = true;
        }

        function startDrag(event: DragEvent, item: SequenceItem) {
            event.dataTransfer!.dropEffect = "move";
            event.dataTransfer!.effectAllowed = "move";
            emit("update:draggingId", item.id);
            // event.dataTransfer!.setData("id", item.id);
        }

        function endDrag() {
            console.log("end");
            emit("end");
        }

        return {
            state,
            onTabClick,
            getDeviceSequenceItems,
            startDrag,
            endDrag,
        };
    },
});
</script>
