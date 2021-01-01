import React from "react";
import * as PropTypes from "prop-types";
import { range } from "lodash";
import DeckButton from "./DeckButton";
import "../assets/scss/components/Deck.scss";

const Deck = ({ rows, columns, onButtonSelected, selectedButton, configs }) => {
  const renderButton = (row, col) => {
    const index = row * columns + col;
    const buttonConfig = configs?.buttons?.find(b => b.index === index);

    return (
      <div className="col deckColumn" key={index}>
        <DeckButton index={index} onSelected={onButtonSelected} selected={index === selectedButton} buttonConfig={buttonConfig} />
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
  rows: PropTypes.number.isRequired,
  columns: PropTypes.number.isRequired,
  onButtonSelected: PropTypes.func.isRequired,
  selectedButton: PropTypes.number,
  configs: PropTypes.shape().isRequired,
};

Deck.defaultProps = {
  selectedButton: null,
};

export default Deck;
