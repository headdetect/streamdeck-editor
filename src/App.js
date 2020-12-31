import React, { useState } from "react";
import { listStreamDecks, setBrightness, fillImage, fillColor } from "elgato-stream-deck";
import { first } from "lodash";

import Deck from "./components/Deck";
import useConfig from "./hooks/useConfig";
import PropertiesTray from "./components/PropertiesTray";

async function updateStreamDeck(deck, config) {
  const buttons = config?.buttons || [];
  const brightness = config?.brightness || 70;

  setBrightness()

  for (const button of buttons) {

  }
}

export default function App() {
  const decks = listStreamDecks();

  const primary = first(decks);

  const [selectedDeck, setSelectedDeck] = useState(primary);
  const [selectedButton, setSelectedButton] = useState(null);
  const [config] = useConfig();

  updateStreamDeck(config).catch(e => {
    // TODO: Show error if can't update

    console.log(e);
  });

  const buttonSelected = buttonIndex => {
    setSelectedButton(buttonIndex);
  };

  return (
    <div className="row p-4">
      <div className="col-8">
        <select onChange={ele => setSelectedDeck(decks.find(d => d.serialNumber === ele.target.value))} className="mb-3">
          {
            decks.map(deck => <option key={deck.serialNumber} value={deck.serialNumber}>{deck.model} {deck.serialNumber}</option>)
          }
        </select>
        {
          selectedDeck ? <Deck deckDevice={selectedDeck} onButtonSelected={buttonSelected} selectedButton={selectedButton} /> : <></>
        }
      </div>
      <div className="col-4">
        {
          selectedButton !== null
            ? <PropertiesTray buttonIndex={selectedButton} />
            : <></>
        }
      </div>
    </div>
  );
}
