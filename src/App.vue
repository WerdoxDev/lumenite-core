<template>
    <div class="h-full flex flex-col relative z-10">
        <NavBar />
        <div class="h-full">
            <router-view></router-view>
        </div>
        <!-- <Footer /> -->
    </div>
    <img class="fixed w-full h-full bottom-0 left-0 top-0 right-0 background" src="./assets/wave.svg" />
    <div class="hidden bg-green-400 bg-yellow-400 bg-red-400 bg-blue-400 bg-pink-400 bg-purple-400 from-green-200 from-yellow-200 from-red-200 to-green-200 to-yellow-200 to-red-200"></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NavBar from "./components/NavBar.vue";
import Footer from "./components/Footer.vue";

export default defineComponent({
    components: {
        NavBar,
        Footer,
    },

    setup() {},
});
</script>

<style>
html,
body,
#app {
    margin: 0;
    padding: 0;
    height: 100%;
}

button:focus {
    outline: none !important;
}

input:focus {
    outline: none !important;
}

.background {
    background-color: #ffffff;
    z-index: -1;
    object-fit: cover;
}

.no-scrollbar::-webkit-scrollbar {
    display: none;
}

.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
