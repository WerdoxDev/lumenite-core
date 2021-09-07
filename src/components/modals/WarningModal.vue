<template>
    <TransitionRoot :show="state.modal.isOpen">
        <Dialog as="div" static class="fixed z-10 inset-0 overflow-y-auto" @close="state.modal.isOpen = false" :open="state.modal.isOpen">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
                    <DialogOverlay class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </TransitionChild>

                <!-- This element is to trick the browser into centering the modal contents. -->
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                    <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div class="sm:flex sm:items-start">
                                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0">
                                    <ExclamationIcon class="h-8 w-8 text-yellow-600" aria-hidden="true" />
                                </div>
                                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <DialogTitle as="h3" class="text-lg leading-6 font-medium text-gray-900"> {{ state.modal.title }} </DialogTitle>
                                    <div class="mt-2">
                                        <p class="text-md text-gray-500">{{ state.modal.text }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse items-center">
                            <button type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm" @click="ok()">Do it!</button>
                            <button type="button" class="w-full inline-flex rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm flex-shrink-0" @click="close()">Cancel</button>
                            <p v-if="state.code" class="text-sm text-gray-500 text-left w-full mt-3 sm:mt-0">Code: {{ state.code }}</p>
                        </div>
                    </div>
                </TransitionChild>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { TransitionRoot, TransitionChild, Dialog, DialogOverlay, DialogTitle } from "@headlessui/vue";
import { ExclamationIcon } from "@heroicons/vue/outline";
import { ModalState } from "../../../types";

export default defineComponent({
    components: {
        TransitionRoot,
        TransitionChild,
        Dialog,
        DialogOverlay,
        DialogTitle,
        ExclamationIcon,
    },
    emits: ["ok"],
    setup(props, { emit }) {
        const state = reactive({
            modal: { isOpen: false, title: "", text: "" } as ModalState,
            code: "",
        });

        function open(title: string, text: string, code = "") {
            state.modal.title = title;
            state.modal.text = text;
            state.code = code;
            state.modal.isOpen = true;
        }

        function close() {
            state.modal.isOpen = false;
        }

        function ok() {
            emit("ok");
            close();
        }

        return {
            state,
            open,
            close,
            ok,
        };
    },
});
</script>
