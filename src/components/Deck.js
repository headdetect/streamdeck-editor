import React from "react";
import * as PropTypes from "prop-types";
import { range } from "lodash";
import { useSelector } from "react-redux";
import DeckButton from "./DeckButton";
import "../assets/scss/components/Deck.scss";

const Deck = ({ onButtonSelected }) => {
  const deviceProperties = useSelector(state => state.device.deviceProperties);
  const config = useSelector(state => state.deck.config);
  const selectedButton = useSelector(state => state.deck.activeButtonIndex);

  const rows = deviceProperties.ROWS;
  const columns = deviceProperties.COLUMNS;

  const renderButton = (row, col) => {
    const index = row * columns + col;
    const buttonConfig = config.buttons?.find(b => b.index === index);

    return (
      <div className="col deckColumn" key={index}>
        <DeckButton size={deviceProperties.ICON_SIZE} onSelected={() => onButtonSelected(index)} selected={index === selectedButton} buttonConfig={buttonConfig} />
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
  onButtonSelected: PropTypes.func.isRequired,
};

export default Deck;
