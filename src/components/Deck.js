import React, { useState } from "react";
import { openStreamDeck } from "elgato-stream-deck";
import * as PropTypes from "prop-types";
import { range } from "lodash";
import DeckButton from "./DeckButton";
import "./Deck.css";

const Deck = ({ deckPath }) => {
  const [selectedButton, setSelectedButton] = useState(null);

  const info = openStreamDeck(deckPath);

  const rows = info.KEY_ROWS;
  const columns = info.KEY_COLUMNS;

  return (
    <div>
      {
        range(rows).map(row => (
          <div className="row deckRow" key={row}>
            {
              range(columns).map(col => (
                <div className="col deckColumn" key={row * columns + col}>
                  <DeckButton keyCode={row * columns + col} onSelected={setSelectedButton} />
                </div>
              ))
            }
          </div>
        ))
      }
    </div>
  );
};

Deck.propTypes = {
  deckPath: PropTypes.string.isRequired,
};

export default Deck;
