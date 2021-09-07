<template>
    <div class="max-w-7xl mx-auto pb-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
            <div class="flex items-center h-full lg:flex-row justify-center">
                <div class="flex flex-col">
                    <label for="password" class="block text-2xl font-medium text-gray-700">Password</label>
                    <div class="mt-1 mb-2 relative rounded-md shadow-md">
                        <input v-model="state.enteredPassword" type="password" name="password" id="password" class="border focus:ring-indigo-500 focus:border-indigo-500 block w-full py-2 px-2 text-2xl border-gray-200 rounded-md" placeholder="Enter password..." />
                    </div>
                    <button @click="login()" class="w-52 self-center bg-purple-600 text-white text-2xl font-semibold py-2 rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-200">Enter</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { useRouter } from "../router/router";
import { store } from "../store/store";

export default defineComponent({
    setup() {
        const router = useRouter();
        const state = reactive({
            enteredPassword: "",
        });

        function login() {
            if (state.enteredPassword != "123") return;
            router.push({ path: "/dashboard" });
        }

        return {
            state,
            login,
        };
    },
});
</script>
