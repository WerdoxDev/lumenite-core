<template>
    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row items-center justify-between rounded-lg rounded-b-none">
        <button type="button" class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm" @click="$emit('back')">Back</button>
        <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:w-auto sm:text-sm" @click="submit()">Next</button>
    </div>
    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 sm:flex sm:divide-x-2 rounded-lg rounded-t-none">
        <div class="w-full">
            <div class="relative flex items-center space-x-2">
                <span class="text-md text-gray-700">Name:</span>
                <input v-model="state.name" class="relative shadow-sm border focus:ring-indigo-500 focus:border-indigo-500 block py-1 px-1 text-md border-gray-200 rounded-md text-center" placeholder="e.g: Friday living room" />
            </div>
            <div class="mt-2 relative flex flex-col sm:flex-row items-center">
                <span class="text-md mr-0 sm:mr-2 text-center sm:text-left text-gray-700">Weekdays:</span>
                <div class="mt-1 sm:mt-0 flex items-center justify-around space-x-1">
                    <div v-for="weekday in state.weekdays" :key="weekday.id" @click="selectWeekday(weekday)">
                        <button class="w-10 h-10 transition-all flex items-center justify-center">
                            <div class="w-9 h-9 absolute rounded-full border flex items-center justify-center transition-transform ease-out duration-75 shadow-md" :class="weekday.selected ? 'transform scale-100 border-b-4 border-green-400' : 'transform scale-0'"></div>
                            <span class="text-md p-1 transition-all ease-out" :class="weekday.selected ? 'text-green-600 font-bold' : 'text-black'">{{ weekday.text }}</span>
                        </button>
                    </div>
                </div>
            </div>
            <div v-if="state.showDates" class="mt-2">
                <div class="relative flex flex-col sm:flex-row items-center">
                    <span class="text-md mr-0 sm:mr-2 text-center sm:text-left text-gray-700 flex-shrink-0">Selected Dates:</span>
                    <div class="flex items-center space-x-1 flex-wrap">
                        <span> {{ state.calendar.selectedDates.length }} </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row items-center shadow-lg rounded-lg rounded-t-none">
        <Popover v-slot="{ open }" class="relative">
            <PopoverButton :class="open ? '' : 'text-opacity-90'" class="group border border-green-400 w-full rounded-md shadow-sm flex items-center justify-center px-4 py-2 space-x-2 cursor-pointer hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto">
                <span class="text-md text-green-600 font-bold group-hover:text-white">Choose Date</span>
                <CalendarIcon class="w-5 h-5 text-green-600 group-hover:text-white" />
            </PopoverButton>

            <transition enter-active-class="transition duration-200 ease-out" enter-from-class="translate-y-1 opacity-0" enter-to-class="translate-y-0 opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-1 opacity-0">
                <PopoverPanel class="absolute z-10 w-screen max-w-sm px-4 transform -translate-x-1/2 bottom-14 left-1/2 sm:px-0">
                    <div class="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                        <div class="bg-gradient-to-br from-purple-100 to-pink-200 rounded-lg rounded-b-none shadow-xl">
                            <div class="flex justify-between items-center p-3">
                                <ChevronLeftIcon class="w-5 h-5 text-gray-600 cursor-pointer transition-transform transform hover:-translate-x-0.5" @click="changeMonth(-1)" />
                                <span class="text-gray-600 text-center text-xl select-none">{{ monthsMap[state.calendar.month] }} {{ state.calendar.year }}</span>
                                <ChevronRightIcon class="w-5 h-5 text-gray-600 cursor-pointer transition-transform transform hover:translate-x-0.5" @click="changeMonth(+1)" />
                            </div>
                        </div>
                        <div class="bg-white px-2 py-5 flex flex-col space-y-3">
                            <div class="flex justify-between">
                                <span v-for="day in daysMap" :key="day" class="w-full text-center select-none">{{ day.substring(0, 1) }}</span>
                            </div>
                            <div v-for="index in 6" :key="index" class="flex justify-between">
                                <div v-for="day in getMonths(index)" :key="day.index" class="group w-full text-center hover:bg flex items-center justify-center cursor-pointer" :class="day.isDiffMonth ? 'text-gray-300' : 'text-black'" @click="selectDate(day)">
                                    <div class="w-9 h-9 absolute rounded-full border flex items-center justify-centertransition-transform duration-75 ease-out transform scale-0 group-hover:scale-100 shadow-md" :class="day.selected ? 'scale-100 border-b-4 border-green-300' : day.isToday ? 'scale-100 border-t-4 border-purple-400' : 'border-green-400'"></div>
                                    <span class="text-md p-1 transition-all ease-out" :class="day.selected ? 'text-green-600 font-bold' : day.isDiffMonth ? 'text-gray-300' : 'text-gray-700'">{{ day.date }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse items-center rounded-lg rounded-t-none">
                            <PopoverButton type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm" @click="closeCalendar()">OK</PopoverButton>
                            <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" @click="clearSelectedDates()">Clear</button>
                        </div>
                    </div>
                </PopoverPanel>
            </transition>
        </Popover>
        <span class="mt-2 text-center text-md text-gray-400 sm:ml-2 sm:mt-0 sm:text-left">Choosing date will disable weekdays!</span>
    </div>
    <WarningModal ref="warningModal" @ok="clearSelectedDates()"></WarningModal>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from "vue";
import { Switch, Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/outline";
import { CalendarDate, Calendar, Weekday, AutomaticTiming, AutomaticDate, AutomaticWeekday } from "../../../types";
import WarningModal from "./WarningModal.vue";

const daysMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthsMap = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default defineComponent({
    name: "CreateAutomatic",
    components: {
        Switch,
        Popover,
        PopoverButton,
        PopoverPanel,
        ChevronRightIcon,
        ChevronLeftIcon,
        CalendarIcon,
        WarningModal,
    },
    emits: ["back", "submit"],
    setup(props, { emit }) {
        const warningModal = ref<InstanceType<typeof WarningModal>>();

        const state = reactive({
            weekdays: [
                { id: 0, text: "Mo", selected: false },
                { id: 1, text: "Tu", selected: false },
                { id: 2, text: "We", selected: false },
                { id: 3, text: "Th", selected: false },
                { id: 4, text: "Fr", selected: false },
                { id: 5, text: "Sa", selected: false },
                { id: 6, text: "Su", selected: false },
            ] as Array<Weekday>,
            monthDetails: Array<CalendarDate>(),
            calendar: { selectedDates: [], month: 0, year: 0 } as Calendar,
            showDates: false,
            name: "",
        });

        function getMonths(row: number) {
            var offset = -1 + row;
            var result = state.monthDetails.filter((x) => x.index >= (row - 1) * 6 + offset && x.index <= row * 6 + offset);
            return result;
        }

        function getFormattedTime(timestamp: number) {
            var date = new Date(timestamp);
            return `${monthsMap[date.getMonth()].substring(0, 3)} ${daysMap[date.getDay()].substring(0, 3)} ${date.getDate()} ${date.getFullYear()}`;
        }

        function getMonthDetails(year: number, month: number) {
            var firstDay = new Date(year, month).getDay();
            var numberOfDays = getNumberOfDays(year, month);
            var monthArray: Array<any> = [];
            var rows = 6;
            var cols = 7;
            var index = 0;
            var day: CalendarDate;
            var date = new Date();
            var todayTimeStamp = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    day = getDayDetails(index, numberOfDays, firstDay, year, month, monthArray[index - 1]);
                    if (state.calendar.selectedDates.some((x) => x === day.timestamp)) day.selected = true;
                    if (todayTimeStamp === day.timestamp) day.isToday = true;
                    monthArray.push(day);
                    index++;
                }
            }

            return monthArray;
        }

        function changeMonth(amount: number) {
            state.calendar.month += amount;
            state.monthDetails = getMonthDetails(state.calendar.year, state.calendar.month);
        }

        function getDayDetails(index: number, numberOfDays: number, firstDay: number, year: number, month: number, lastDate: CalendarDate) {
            var date = index - firstDay;
            var day = index % 7;
            var prevMonth = month - 1;
            var currentMonth = month;
            var prevYear = year;
            var currentYear = year;
            Object.freeze(month);
            Object.freeze(year);
            if (prevMonth < 0) {
                prevMonth = 11;
                prevYear--;
            }
            if (month > 11) {
                currentMonth = 0;
                currentYear++;
                state.calendar.month = currentMonth;
                state.calendar.year = currentYear;
            } else if (month < 0) {
                currentMonth = 11;
                currentYear--;
                state.calendar.month = currentMonth;
                state.calendar.year = currentYear;
            }

            var prevMonthNumberOfDays = getNumberOfDays(prevYear, prevMonth);
            var newDate = (date < 0 ? prevMonthNumberOfDays + date : date % numberOfDays) + 1;

            var isDiffMonth = lastDate?.isDiffMonth;
            if ((lastDate?.date | 0) + 1 !== newDate) isDiffMonth = !isDiffMonth;
            if (date < 0) currentMonth--;
            else if (isDiffMonth) currentMonth++;
            var timestamp = new Date(year, currentMonth, newDate).getTime();

            return {
                index,
                date: newDate,
                day,
                month: currentMonth,
                timestamp,
                dayString: daysMap[day],
                selected: false,
                isToday: false,
                isDiffMonth,
            } as CalendarDate;
        }

        function getNumberOfDays(year: number, month: number) {
            return 40 - new Date(year, month, 40).getDate();
        }

        function selectDate(date: CalendarDate) {
            var index = state.calendar.selectedDates.findIndex((x) => x === date.timestamp);
            if (index !== -1) {
                date.selected = false;
                state.calendar.selectedDates.splice(index, 1);
                if (state.calendar.selectedDates.length <= 0) state.showDates = false;
            } else {
                date.selected = true;
                state.calendar.selectedDates.push(date.timestamp);
            }
            if (date.isDiffMonth) changeMonth(date.month - state.calendar.month);
        }

        function clearSelectedDates() {
            if (state.calendar.selectedDates.length <= 0) return;
            state.monthDetails.forEach((x) => {
                x.selected = false;
            });

            state.calendar.selectedDates.splice(0, state.calendar.selectedDates.length);
            changeMonth(0);
            state.showDates = false;
        }

        function closeCalendar() {
            state.showDates = true;
            state.weekdays.forEach((x) => {
                x.selected = false;
            });
        }

        function selectWeekday(weekday: Weekday) {
            if (state.calendar.selectedDates.length > 0) {
                warningModal.value?.open("Warning", "Selecting a weekday while datesare selected will clear all dates! Are you sure?");
            } else weekday.selected = !weekday.selected;
        }

        function submit() {
            var dates: Array<AutomaticDate> = state.calendar.selectedDates.map((x) => {
                var date = new Date(x);
                return { year: date.getFullYear(), month: date.getMonth(), date: date.getDate() } as AutomaticDate;
            });
            var weekdays: Array<AutomaticWeekday> = state.weekdays
                .filter((x) => x.selected)
                .map((x) => {
                    return { day: x.id } as AutomaticWeekday;
                });
            var automaticTiming = { name: state.name, dates, weekdays } as AutomaticTiming;

            emit("submit", automaticTiming);
        }

        onMounted(() => {
            const date = new Date();
            state.calendar.year = date.getFullYear();
            state.calendar.month = date.getMonth();
            state.monthDetails = getMonthDetails(state.calendar.year, state.calendar.month);
        });

        return {
            state,
            selectDate,
            changeMonth,
            getMonths,
            getFormattedTime,
            clearSelectedDates,
            closeCalendar,
            submit,
            selectWeekday,
            monthsMap,
            daysMap,
            warningModal,
        };
    },
});
</script>
