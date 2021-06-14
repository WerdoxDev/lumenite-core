<template>
    <div>
        <Disclosure as="nav" class="bg-gray-800" v-slot="{ open }">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <a href="#" class="text-4xl text-white font-semibold">Lumenite</a>
                        </div>
                        <div class="hidden md:block">
                            <div class="ml-10 flex items-baseline space-x-4">
                                <template v-for="(item, itemIdx) in navigation" :key="item">
                                    <template v-if="itemIdx === 0">
                                        <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
                                        <a href="#" class="bg-gray-900 text-white px-3 py-2 rounded-md text-md font-medium">{{ item }}</a>
                                    </template>
                                    <a v-else href="#" class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">{{ item }}</a>
                                </template>
                            </div>
                        </div>
                    </div>
                    <div class="hidden md:block">
                        <div class="ml-4 flex items-center md:ml-6">
                            <!-- Profile dropdown -->
                            <Menu as="div" class="ml-3 relative">
                                <div>
                                    <MenuButton class="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                                        <span class="sr-only">Open user menu</span>
                                        <img class="h-8 w-8 rounded-full" src="./assets/werdox.png" alt="" />
                                    </MenuButton>
                                </div>
                                <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                                    <MenuItems class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <MenuItem v-for="item in profile" :key="item" v-slot="{ active }">
                                            <a href="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">{{ item }}</a>
                                        </MenuItem>
                                    </MenuItems>
                                </transition>
                            </Menu>
                        </div>
                    </div>
                    <div class="-mr-2 flex md:hidden">
                        <!-- Mobile menu button -->
                        <DisclosureButton class="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                            <span class="sr-only">Open main menu</span>
                            <MenuIcon v-if="!open" class="block h-6 w-6" aria-hidden="true" />
                            <XIcon v-else class="block h-6 w-6" aria-hidden="true" />
                        </DisclosureButton>
                    </div>
                </div>
            </div>

            <DisclosurePanel class="md:hidden">
                <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <template v-for="(item, itemIdx) in navigation" :key="item">
                        <template v-if="itemIdx === 0">
                            <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
                            <a href="#" class="bg-gray-900 text-white block px-3 py-2 rounded-md text-base font-medium">{{ item }}</a>
                        </template>
                        <a v-else href="#" class="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">{{ item }}</a>
                    </template>
                </div>
                <div class="pt-4 pb-3 border-t border-gray-700">
                    <div class="flex items-center px-5">
                        <div class="flex-shrink-0">
                            <img class="h-10 w-10 rounded-full" src="./assets/werdox.png" alt="" />
                        </div>
                        <div class="ml-3">
                            <div class="text-base font-medium leading-none text-white">Werdox</div>
                            <div class="text-sm font-medium leading-none text-gray-400">matin.tat85@gmail.com</div>
                        </div>
                        <button class="ml-auto bg-gray-800 flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                            <span class="sr-only">View notifications</span>
                            <BellIcon class="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                    <div class="mt-3 px-2 space-y-1">
                        <a v-for="item in profile" :key="item" href="#" class="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700">{{ item }}</a>
                    </div>
                </div>
            </DisclosurePanel>
        </Disclosure>

        <header class="bg-white shadow">
            <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
            </div>
        </header>
        <main>
            <div v-if="state.loggedIn" class="mt-5 ml-5 flex items-center space-x-2">
                <div class="rounded-full w-5 h-5" :class="state.connected ? 'bg-green-500' : 'bg-red-500'" />
                <div>{{ state.connected ? "CONNECTED" : "DISCONNECTED" }}</div>
            </div>
            <div class="max-w-7xl mx-auto pb-6 sm:px-6 lg:px-8">
                <!-- Replace with your content -->
                <div class="px-4 py-6 sm:px-0">
                    <div class="flex items-center h-full lg:flex-row" :class="!state.connected ? 'justify-center' : ''">
                        <div v-if="state.connected" class="p-5 m-10 h-full bg-gray-700 mx-auto rounded-lg shadow-2xl">
                            <div class="p-4 h-full flex gap-10 justify-center flex-row flex-wrap mx-auto">
                                <div v-for="light in state.lightsStatus" :key="light.index" @click="onLightClick(light)" :class="`bg-${getCurrentColor(light)}-400`" class="h-56 w-full md:w-64 rounded-lg shadow-2xl cursor-pointer transform focus:scale-100 hover:scale-105 transition-all flex-grow flex-shrink-0">
                                    <div class="flex h-full justify-center items-center flex-col">
                                        <a href="#" class="text-white font-semibold text-4xl">Light {{ light.index + 1 }}</a>
                                        <p class="text-gray-200">{{ light.status == StatusType.PROCESSING ? light.status + "..." : light.status }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-if="!state.connected && state.loggedIn">
                            <h1 class="text-black font-semibold text-4xl">Connecting...</h1>
                        </div>
                        <div v-if="!state.loggedIn" class="flex flex-col">
                            <label for="password" class="block text-2xl font-medium text-gray-700">Password</label>
                            <div class="mt-1 mb-2 relative rounded-md shadow-md">
                                <input v-model="state.enteredPassword" type="text" name="password" id="password" class="border focus:ring-indigo-500 focus:border-indigo-500 block w-full py-2 px-2 text-2xl border-gray-200 rounded-md" placeholder="Enter password..." />
                            </div>
                            <button @click="login" class="w-52 self-center bg-purple-600 text-white text-2xl text-base font-semibold py-2 rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-200">Enter</button>
                        </div>
                    </div>
                </div>
                <!-- /End replace -->
            </div>
            <div class="w-full absolute bottom-8">
                <h1 class="text-center text-xl">تمام حقوق متعلق به متین تات میباشد</h1>
            </div>
        </main>
        <div class="hidden bg-green-400 bg-yellow-400 bg-red-400 from-green-200 from-yellow-200 from-red-200 to-green-200 to-yellow-200 to-red-200"></div>
    </div>
    <div class="absolute inset-0 bg-gradient-to-b from-white to-gray-200" style="z-index: -1"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from "vue";
import HelloWorld from "./components/HelloWorld.vue";
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems, Switch } from "@headlessui/vue";
import { BellIcon, MenuIcon, XIcon } from "@heroicons/vue/outline";
import { io, Socket } from "socket.io-client";
import { Light, StatusType } from "../types";

//const navigation = ["Dashboard", "Team", "Projects", "Calendar", "Reports"];
const navigation = ["Dashboard"];
const profile = ["Your Profile", "Settings", "Sign out"];
const numOfLight: number = 2;
const colors = { ON: "green", PROCESSING: "yellow", OFF: "red" };

export default defineComponent({
    name: "App",
    components: {
        HelloWorld,
        Disclosure,
        DisclosureButton,
        DisclosurePanel,
        Menu,
        MenuButton,
        MenuItem,
        MenuItems,
        BellIcon,
        MenuIcon,
        Switch,
        XIcon,
    },

    setup() {
        let socket: Socket;

        const state = reactive({
            connected: false,
            loggedIn: false,
            enteredPassword: "",
            lightsStatus: Array<Light>(),
        });

        function login() {
            if (state.enteredPassword != "matin1385") return;
            for (let i = 0; i < numOfLight; i++) {
                state.lightsStatus.push({ index: i, status: StatusType.OFF });
            }

            // socket = io("http://192.168.1.115:3001");
            // socket = io("http://192.168.1.102:3001");
            socket = io("https://lumenite.matin-tat.ir");

            socket.on("connect", () => {
                state.connected = true;

                socket.on("disconnect", () => {
                    state.connected = false;
                });
            });

            socket.on("light-change-confirm", (light: Light) => {
                state.lightsStatus[light.index].status = light.status;
            });

            state.loggedIn = true;
        }

        function getCurrentColor(light: Light) {
            return colors[light.status.toString()];
        }

        function onLightClick(light: Light) {
            socket.emit("light-change", light, light.status == StatusType.ON ? StatusType.OFF : StatusType.ON);
            state.lightsStatus[light.index].status = StatusType.PROCESSING;
        }

        return {
            navigation,
            profile,
            onLightClick,
            getCurrentColor,
            login,
            state,
            StatusType,
        };
    },
});
</script>

<style>
button:focus {
    outline: none !important;
}

input:focus {
    outline: none !important;
}
</style>
