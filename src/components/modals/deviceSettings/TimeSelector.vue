<template>
    <div></div>
    <!-- <div class="relative flex items-center space-x-2 mt-2">
        <h2 class="text-md text-gray-700">{{ text }}</h2>
        <div class="flex">
            <Listbox v-model="time.hour" class="w-10">
                <div class="relative">
                    <ListboxButton class="relative w-full py-2 text-center bg-white border rounded-lg rounded-r-none shadow-sm cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
                        <span class="block truncate">{{ time.hour }}h</span>
                    </ListboxButton>

                    <transition leave-active-class="transition duration-100 ease-in" leave-to-class="opacity-0" enter-active-class="transition duration-100 ease-in" enter-from-class="opacity-0">
                        <ListboxOptions class="absolute w-full py-1 overflow-auto no-scrollbar text-base bg-white rounded-md shadow-lg max-h-40 sm:max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            <ListboxOption v-slot="{ active, selected }" v-for="hour in times.hours" :key="hour" :value="hour" as="template" class="hover:bg-gray-100">
                                <li :class="[active ? 'text-amber-900 bg-amber-100' : 'text-gray-900', 'cursor-default select-none relative py-2 text-center']">
                                    <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{ hour }}</span>
                                </li>
                            </ListboxOption>
                        </ListboxOptions>
                    </transition>
                </div>
            </Listbox>
            <Listbox v-model="time.minute" class="w-10">
                <div class="relative">
                    <ListboxButton class="relative w-full py-2 text-center bg-white border border-l-0 border-r-0 shadow-sm cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
                        <span class="block truncate">{{ time.minute }}m</span>
                    </ListboxButton>

                    <transition leave-active-class="transition duration-100 ease-in" leave-to-class="opacity-0" enter-active-class="transition duration-100 ease-in" enter-from-class="opacity-0">
                        <ListboxOptions class="absolute w-full py-1 overflow-auto no-scrollbar text-base bg-white rounded-md shadow-lg max-h-40 sm:max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            <ListboxOption v-slot="{ active, selected }" v-for="minute in times.minutes" :key="minute" :value="minute" as="template" class="hover:bg-gray-100">
                                <li :class="[active ? 'text-amber-900 bg-amber-100' : 'text-gray-900', 'cursor-default select-none relative py-2 text-center']">
                                    <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{ minute }}</span>
                                </li>
                            </ListboxOption>
                        </ListboxOptions>
                    </transition>
                </div>  
            </Listbox>
        </div>
    </div> -->
</template>

// <script lang="ts">
// import { defineComponent, PropType, reactive, ref, watch } from "vue";
// import { getMsFromTime, getTimeFromMs } from "../../../../types";
// import { Listbox, ListboxOptions, ListboxOption, ListboxButton } from "@headlessui/vue";

// const times = {
//     hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
//     minutes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
//     seconds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
// };

// export default defineComponent({
//     name: "TimeSelector",
//     props: {
//         text: String,
//         data: {
//             type: Object as PropType<Timing>,
//             required: true,
//         },
//     },
//     components: {
//         Listbox,
//         ListboxOptions,
//         ListboxOption,
//         ListboxButton,
//     },
//     setup(props, { emit }) {
//         const time = ref(getTimeFromMs(props.data.time));

//         watch(time.value, () => {
//             console.log("update time");
//             console.log(props.data.afterId);
//             var newTiming = { ...props.data };
//             newTiming.time = getMsFromTime(time.value);
//             emit("update:data", newTiming);
//         });

//         return {
//             time,
//             times,
//         };
//     },
// });
//
</script>


<!--  
<Listbox v-model="time.second" class="w-10">
                <div class="relative">
                    <ListboxButton class="relative w-full py-2 text-center bg-white border rounded-lg rounded-l-none shadow-sm cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
                        <span class="block truncate">{{ time.second }}s</span>
                    </ListboxButton>

                    <transition leave-active-class="transition duration-100 ease-in" leave-to-class="opacity-0" enter-active-class="transition duration-100 ease-in" enter-from-class="opacity-0">
                        <ListboxOptions class="absolute w-full py-1 overflow-auto no-scrollbar text-base bg-white rounded-md shadow-lg max-h-40 sm:max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            <ListboxOption v-slot="{ active, selected }" v-for="second in times.seconds" :key="second" :value="second" as="template" class="hover:bg-gray-100">
                                <li :class="[active ? 'text-amber-900 bg-amber-100' : 'text-gray-900', 'cursor-default select-none relative py-2 text-center']">
                                    <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{ second }}</span>
                                </li>
                            </ListboxOption>
                         </ListboxOptions>
                     </transition>
                 </div>
</Listbox>
-->