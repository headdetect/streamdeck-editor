import React, { useMemo } from "react";
import { openStreamDeck } from "elgato-stream-deck";
import * as PropTypes from "prop-types";
import { range } from "lodash";
import DeckButton from "./DeckButton";
import "../assets/scss/components/Deck.scss";

const Deck = ({ deckDevice, onButtonSelected, selectedButton }) => {
  const info = useMemo(() => openStreamDeck(deckDevice.path), [deckDevice.path]);

  const rows = info.KEY_ROWS;
  const columns = info.KEY_COLUMNS;

  const renderButton = (row, col) => {
    const index = row * columns + col;

    return (
      <div className="col deckColumn" key={index}>
        <DeckButton index={index} onSelected={onButtonSelected} selected={index === selectedButton} />
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
  deckDevice: PropTypes.shape({
    model: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    serialNumber: PropTypes.string.isRequired,
  }).isRequired,
  onButtonSelected: PropTypes.func.isRequired,
  selectedButton: PropTypes.number,
};

Deck.defaultProps = {
  selectedButton: null,
};

export default Deck;
