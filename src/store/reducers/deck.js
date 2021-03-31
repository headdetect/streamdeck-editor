import * as actionTypes from "../types";

const initialState = {
  activeButtonIndex: null,
  config: null, // array of buttons
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.SET_ACTIVE_BUTTON_INDEX: {
      const { activeButtonIndex } = action.payload;
      return {
        ...state,
        activeButtonIndex,
      };
    }
    case actionTypes.SET_BUTTON: {
      const { button } = action.payload;

      const currentDeck = [...state.deck];
      const index = currentDeck.findIndex(b => b.index === button.index);

      if (index !== -1) {
        currentDeck.push(button);
      } else {
        currentDeck[index] = button;
      }

      return {
        ...state,
        deck: currentDeck,
      };
    }
    case actionTypes.SET_CONFIG: {
      const { config } = action.payload;
      return {
        ...state,
        config,
      };
    }
    default:
      return state;
  }
}
