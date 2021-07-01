import { Module } from "vuex";
import {
  ActionsType,
  DeviceSettingsState,
  emptySettings,
  GettersType,
  ManualTimingPayload,
  ManualTimingType,
  MutationType,
  State,
  Time,
} from "../../types";

export const deviceSettings: Module<DeviceSettingsState, State> = {
  state: {
    settings: emptySettings(),
  },
  mutations: {
    [MutationType.SetManualTiming](state: DeviceSettingsState, payload: ManualTimingPayload) {
      if (payload.type === ManualTimingType.ToggleDelay) {
        state.settings.timings!.manualTimings!.toggleTiming!.toggleDelay = payload.time;
      } else if (payload.type === ManualTimingType.PulseDelay) {
        state.settings.timings!.manualTimings!.pulseTiming!.pulseDelay = payload.time;
      } else if (payload.type === ManualTimingType.PulseTimeout) {
        state.settings.timings!.manualTimings!.pulseTiming!.pulseTimeout = payload.time;
      }
    },
  },
  actions: {
    [ActionsType.SetManualTiming]({ commit }, payload: ManualTimingPayload) {
      commit(MutationType.SetManualTiming, payload);
    },
  },
  getters: {
    [GettersType.GetManualTiming]: (state) => (type: ManualTimingType) => {
      if (type === ManualTimingType.ToggleDelay) {
        return state.settings.timings?.manualTimings?.toggleTiming?.toggleDelay;
      } else if (type === ManualTimingType.PulseDelay) {
        return state.settings.timings?.manualTimings?.pulseTiming?.pulseDelay;
      } else if (type === ManualTimingType.PulseTimeout) {
        return state.settings.timings?.manualTimings?.pulseTiming?.pulseTimeout;
      }
    },
  },
};
