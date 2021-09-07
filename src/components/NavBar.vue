<template>
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
                                    <router-link to="/dashboard" class="no-underline bg-gray-900 text-white px-3 py-2 rounded-md font-medium">{{ item }}</router-link>
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
                                    <img class="h-8 w-8 rounded-full" src="../assets/werdox.png" alt="" />
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
                        <img class="h-10 w-10 rounded-full" src="../assets/werdox.png" alt="" />
                    </div>
                    <div class="ml-3">
                        <div class="text-base font-medium leading-none text-white">Werdox</div>
                        <div class="text-sm font-medium leading-none text-gray-400">matin.tat85@gmail.com</div>
                    </div>
                    <button class="ml-auto bg-gray-800 flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
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
        <div class="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
            <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
    </header>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { BellIcon, MenuIcon, XIcon } from "@heroicons/vue/outline";

const navigation = ["Dashboard"];
const profile = ["Your Profile", "Settings", "Sign out"];

export default defineComponent({
    components: {
        Disclosure,
        DisclosureButton,
        DisclosurePanel,
        Menu,
        MenuButton,
        MenuItem,
        MenuItems,
        BellIcon,
        MenuIcon,
        XIcon,
    },
    setup() {
        return {
            navigation,
            profile,
        };
    },
});
</script>
