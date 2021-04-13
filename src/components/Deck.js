import React, { useRef, useState } from "react";
import * as PropTypes from "prop-types";
import { range } from "lodash";
import { useSelector } from "react-redux";
import DeckButton from "./DeckButton";
import "../assets/scss/components/Deck.scss";
import Draggable from "react-draggable";
import clsx from "clsx";

import { setActiveButtonIndex, setConfig } from "../store/actions";
import store from "../store/store";


const Deck = ({ onPropertyChange }) => {
  const deviceProperties = useSelector(state => state.device.deviceProperties);
  const config = useSelector(state => state.deck.config);
  const selectedButton = useSelector(state => state.deck.activeButtonIndex);

  // Relating to drag-n-drop
  const buttonLocations = useRef([]);
  const [buttonDraggingIndex, setButtonDraggingIndex] = useState(-1);
  const [buttonHoveringIndex, setButtonHoveringIndex] = useState(-1);

  const rows = deviceProperties.ROWS;
  const columns = deviceProperties.COLUMNS;

  const onButtonSelected = (index) => {
    store.dispatch(setActiveButtonIndex(index));
  }

  const addLocationRef = (ref, index) => {
    if (!ref) return;

    buttonLocations.current[index] = ref.getBoundingClientRect();
  }

  const findButtonAtIndex = (clientX, clientY) =>
    buttonLocations.current.findIndex(({ top, left, right, bottom }) =>
      clientX >= left && clientX <= right && // In bounds on the X-axis //
      clientY >= top && clientY <= bottom // In bounds on the Y-axis //
    )

  const handleDrag = (mouseEvent, index) => {
    const { clientX, clientY } = mouseEvent;
    const buttonHovering = findButtonAtIndex(clientX, clientY);

    setButtonHoveringIndex(buttonHovering);
  };

  const handleDrop = (mouseEvent, index) => {
    const { clientX, clientY } = mouseEvent;

    const dropLocationIndex = findButtonAtIndex(clientX, clientY);
    const pickupConfigIndex = config.buttons?.findIndex(b => b.index === index);
    const dropLocationHasConfig = Boolean(config.buttons?.find(b => b.index === dropLocationIndex));

    if (dropLocationIndex !== -1 && !dropLocationHasConfig && pickupConfigIndex !== -1) {

      // Because the location we're going to is empty, we can just update the index //
      config.buttons[pickupConfigIndex].index = dropLocationIndex;
      store.dispatch(setConfig(config));
      onPropertyChange(config);
      onButtonSelected(dropLocationIndex);
    }

    setButtonDraggingIndex(-1);
    setButtonHoveringIndex(-1);
  }

  const handleStartDragging = (data, index) => {
    setButtonDraggingIndex(index);
  }

  const renderButton = (row, col) => {
    const index = row * columns + col;
    const buttonConfig = config.buttons?.find(b => b.index === index);

    const isBeingDragged = buttonDraggingIndex === index;
    const isBeingHoveredOver = buttonHoveringIndex === index;
    const {x = 0, y = 0} = buttonLocations[index] ?? {};

    return (
        <div className="col deckColumn" key={index} style={{ zIndex: isBeingDragged ? 999 : 1 }}>
          <div className={clsx({ buttonBackdrop: isBeingDragged })} ref={(ref) => addLocationRef(ref, index)} >
            <Draggable
              onStart={(e, d) => handleStartDragging(d, index)}
              onDrag={(e) => handleDrag(e, index)}
              onStop={(e) => handleDrop(e, index)}
              position={({ x, y })}
            >
              <div>
                <DeckButton size={deviceProperties.ICON_SIZE} onSelected={() => onButtonSelected(index)} selected={index === selectedButton || isBeingHoveredOver} buttonConfig={buttonConfig} />
              </div>
            </Draggable>
          </div>
        </div>
    );
  };

  return (
    <div>
      {
        range(rows).map(row => (
          <div className="row deckRow" key={row}>
            {
              range(columns).map(col => renderButton(row, col))
            }
          </div>
        ))
      }
    </div>
  );
};

Deck.propTypes = {
  onPropertyChange: PropTypes.func.isRequired,
};

export default Deck;
