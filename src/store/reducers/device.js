import * as actionTypes from "../types";

const initialState = {
  deviceProperties: null,
  deviceInfo: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.SET_ACTIVE_DEVICE_PROPERTIES: {
      const { deviceProperties } = action.payload;
      return {
        ...state,
        deviceProperties,
      };
    }
    case actionTypes.SET_ACTIVE_DEVICE_INFO: {
      const { deviceInfo } = action.payload;
      return {
        ...state,
        deviceInfo,
      };
    }
    default:
      return state;
  }
}
