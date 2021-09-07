<template>
    <TransitionRoot as="template" :show="show">
        <Dialog as="div" static class="z-50 fixed inset-0 overflow-hidden" @close="$emit('close')" :open="show">
            <div class="absolute inset-0 overflow-hidden">
                <TransitionChild as="template" enter="ease-in-out duration-500" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in-out duration-500" leave-from="opacity-100" leave-to="opacity-0">
                    <DialogOverlay class="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </TransitionChild>
                <div class="fixed inset-y-0 left-0 max-w-full flex">
                    <TransitionChild as="template" enter="transform transition ease-in-out duration-500 sm:duration-700" enter-from="-translate-x-full" enter-to="translate-x-0" leave="transform transition ease-in-out duration-500 sm:duration-700" leave-from="translate-x-0" leave-to="-translate-x-full">
                        <div class="relative w-max">
                            <TransitionChild as="template" enter="ease-in-out duration-500" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in-out duration-500" leave-from="opacity-100" leave-to="opacity-0">
                                <div @click="$emit('close')" class="absolute top-2 -right-12 flex cursor-pointer bg-gray-800 rounded-lg p-2 hover:bg-gray-700 text-white">
                                    <XIcon class="h-6 w-6" />
                                </div>
                            </TransitionChild>
                            <div class="h-full flex flex-col py-6 bg-white shadow-xl">
                                <div class="px-4 sm:px-6">
                                    <DialogTitle class="text-2xl font-medium text-gray-900">{{ title }}</DialogTitle>
                                </div>
                                <div class="mt-6 relative flex-1 px-4 sm:px-6">
                                    <div class="absolute inset-0 px-4 sm:px-6">
                                        <div class="ml-2 flex flex-col">
                                            <div v-for="menu in menus" :key="menu.id">
                                                <p v-if="menu.isHeader" class="text-gray-800 font-bold text-xl mb-2">{{ menu.text }}</p>
                                                <button v-else class="rounded-lg p-1 mb-1 ml-1 hover:bg-gray-300" :class="menu.id === selected.id ? 'bg-gray-200' : ''" @click="$emit('select-menu', menu)">
                                                    <div class="text-gray-800 ml-2 mr-2 text-lg text-left">{{ menu.text }}</div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { TransitionRoot, TransitionChild, Dialog, DialogOverlay, DialogTitle } from "@headlessui/vue";
import { XIcon } from "@heroicons/vue/outline";
import { SettingsModalMenu } from "../../../types";

export default defineComponent({
    components: {
        TransitionRoot,
        TransitionChild,
        Dialog,
        DialogOverlay,
        DialogTitle,
        XIcon,
    },
    props: {
        title: {
            type: String,
            required: true,
        },
        show: {
            type: Boolean,
            required: true,
        },
        menus: {
            type: Object as PropType<Array<SettingsModalMenu>>,
            required: true,
        },
        selected: {
            type: Object as PropType<SettingsModalMenu>,
            required: true,
        },
    },
    emits: ["close", "select-menu"],
});
</script>
