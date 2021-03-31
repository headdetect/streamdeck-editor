import * as actionTypes from "./types";

export const setActiveDeviceProperties = deviceProperties => ({
  type: actionTypes.SET_ACTIVE_DEVICE_PROPERTIES,
  payload: {
    deviceProperties,
  },
});

export const setActiveDeviceInfo = deviceInfo => ({
  type: actionTypes.SET_ACTIVE_DEVICE_INFO,
  payload: {
    deviceInfo,
  },
});

export const setConfig = config => ({
  type: actionTypes.SET_CONFIG,
  payload: {
    config,
  },
});

export const setButton = button => ({
  type: actionTypes.SET_BUTTON,
  payload: {
    button,
  },
});

export const setActiveButtonIndex = activeButtonIndex => ({
  type: actionTypes.SET_ACTIVE_BUTTON_INDEX,
  payload: {
    activeButtonIndex,
  },
});
