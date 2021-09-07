<template>
    <div class="mt-5 sm:mt-3 sm:mx-4">
        <LabeledList label="Active Sequence" v-model:options="state.sequences" />
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { Listbox, ListboxOptions, ListboxOption, ListboxButton } from "@headlessui/vue";
import { CheckIcon, SelectorIcon } from "@heroicons/vue/solid";
import LabeledList from "../LabeledList.vue";
import { Option } from "../../../types";

export default defineComponent({
    components: {
        Listbox,
        ListboxOptions,
        ListboxOption,
        ListboxButton,
        CheckIcon,
        SelectorIcon,
        LabeledList,
    },
    setup() {
        const state = reactive({
            sequences: [
                { id: 0, text: "Test", selected: true },
                { id: 1, text: "Test1", selected: false },
            ] as Array<Option>,
        });

        return {
            state,
        };
    },
});
</script>
