<template>
    <div class="flex items-center">
        <p class="text-md text-gray-700 mr-2">{{ label }}:</p>
        <input v-model="state.text" type="text" class="border focus:ring-indigo-500 focus:border-indigo-500 py-2 px-2 text-base sm:text-sm border-gray-200 rounded-lg shadow-lg" :placeholder="placeholder" :maxlength="max" />
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
        text: {
            type: String,
            required: false,
        },
        placeholder: {
            type: String,
            required: false,
        },
        max: {
            type: String,
            required: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            text: props.text,
        });

        watch(state, () => {
            emit("update:text", state.text);
        });

        return {
            state,
        };
    },
});
</script>
