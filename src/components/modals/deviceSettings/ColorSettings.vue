<template>
    <div v-if="show" class="sm:flex sm:items-start sm:ml-3 mt-5 sm:mt-2">
        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <div class="mt-1">
                <div class="relative flex items-center justify-center space-x-2 z-30">
                    <div class="w-10 h-10 rounded-full shadow-md cursor-pointer" style="background-color: rgb(255, 0, 0)" @click="$emit('preview', 255, 0, 0)" />
                    <div class="w-10 h-10 rounded-full shadow-md cursor-pointer" style="background-color: rgb(0, 255, 0)" @click="$emit('preview', 0, 255, 0)" />
                    <div class="w-10 h-10 rounded-full shadow-md cursor-pointer" style="background-color: rgb(0, 0, 255)" @click="$emit('preview', 0, 0, 255)" />
                    <div class="w-10 h-10 rounded-full shadow-md cursor-pointer" style="background-color: rgb(255, 255, 0)" @click="$emit('preview', 255, 255, 0)" />
                    <div class="w-10 h-10 rounded-full shadow-md cursor-pointer" style="background-color: rgb(0, 255, 255)" @click="$emit('preview', 0, 255, 255)" />
                    <div class="w-10 h-10 rounded-full shadow-md cursor-pointer" style="background-color: rgb(255, 0, 255)" @click="$emit('preview', 255, 0, 255)" />
                </div>
            </div>
            <div class="mt-3">
                <div class="relative flex items-center space-x-2 z-30">
                    <h2 class="text-md text-gray-700">Custom Color:</h2>
                    <slot></slot>
                </div>
                <button class="mt-3 justify-center rounded-md border border-transparent shadow-lg bg-green-600 py-1 px-2 font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" @click="$emit('preview')">Preview on device</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "ColorSettings",
    props: {
        show: {
            type: Boolean,
            required: true,
        },
    },
    emits: ["preview"],
    setup() {},
});
</script>
