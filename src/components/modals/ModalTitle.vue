<template>
    <div class="flex items-center divide-gray-300 divide-x-2 sm:divide-x-0">
        <div @click="$emit('open')" class="cursor-pointer sm:hidden mr-3 bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-300 hover:bg-gray-700">
            <MenuIcon class="block h-6 w-6 mr-2" />
            <span>Menu</span>
        </div>
        <div class="font-bold text-md pl-2 sm:pl-0 sm:ml-5">{{ text }}</div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { MenuIcon } from "@heroicons/vue/outline";

export default defineComponent({
    name: "ModalTitle",
    components: {
        MenuIcon,
    },
    props: {
        text: {
            type: String,
            required: true,
        },
    },
    emits: ["open"],
});
</script>
