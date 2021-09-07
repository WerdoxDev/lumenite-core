<template>
    <div class="flex items-center divide-gray-300 divide-x-2 sm:divide-x-0">
        <div @click="$emit('open')" class="cursor-pointer shadow-lg mr-3 bg-gray-800 inline-flex items-center justify-center p-2 rounded-lg text-white sm:hidden hover:bg-gray-700">
            <MenuIcon class="block h-5 w-5 mr-2" />
            <span>Menu</span>
        </div>
        <p class="text-gray-800 font-bold pl-3 sm:pl-0">{{ text }}</p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { MenuIcon } from "@heroicons/vue/outline";

export default defineComponent({
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
