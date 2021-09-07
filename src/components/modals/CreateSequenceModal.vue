<template>
    <button @click="state.isOpen = true" type="button" class="rounded-lg h-full shadow-lg px-4 py-2 bg-green-600 font-bold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Create Sequence</button>
    <Modal :show="state.isOpen" @close="state.isOpen = false">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 sm:flex rounded-lg rounded-b-none">
            <div class="w-full">
                <p class="text-gray-800 font-bold">Create Sequence</p>
                <div class="mt-5 sm:mt-3 sm:mx-4">
                    <LabeledList label="Sequence Type" v-model:options="state.sequenceTypes" order="2" />
                    <LabeledTextbox class="mt-2" label="Name" placeholder="e.g My Amazing Sequence" max="16" />
                    <LabeledList v-if="state.sequenceTypes[1].selected === true" class="mt-2" label="Device Type" v-model:options="state.deviceTypes" />
                </div>
            </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse items-center rounded-lg rounded-t-none">
            <button type="button" class="w-full rounded-lg border border-transparent shadow-lg px-4 py-2 bg-green-600 font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm" @click="createSequence()">Create</button>
            <button type="button" class="mt-3 w-full rounded-lg border border-gray-300 shadow-lg px-4 py-2 bg-white font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" @click="state.isOpen = false">Cancel</button>
        </div>
    </Modal>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { Option } from "../../../types";
import { useRouter } from "../../router/router";
import LabeledList from "../LabeledList.vue";
import LabeledTextbox from "../LabeledTextbox.vue";
import Modal from "./Modal.vue";

export default defineComponent({
    components: {
        Modal,
        LabeledList,
        LabeledTextbox,
    },
    setup() {
        const router = useRouter();
        const state = reactive({
            isOpen: false,
            sequenceTypes: [
                { id: 0, text: "Global", selected: true },
                { id: 1, text: "Device", selected: false },
            ] as Array<Option>,
            deviceTypes: [
                { id: 0, text: "Output Device", selected: true },
                { id: 1, text: "Input Device", selected: true },
                { id: 2, text: "RGB Light", selected: false },
            ] as Array<Option>,
        });

        function createSequence() {
            console.log("CREATE!!");
            router.push({ path: "/sequence" });
        }

        return {
            state,
            createSequence,
        };
    },
});
</script>
