import React, { useState } from "react";
import { listStreamDecks } from "elgato-stream-deck";
import { first } from "lodash";

import Deck from "./components/Deck";

export default function App() {
  const decks = listStreamDecks();

  const primary = first(decks);

  const [selectedDeckPath, setSelectedDeckPath] = useState(primary ? primary.path : null);

  return (
    <div className="row p-4">
      <div className="col-8">
        <select onChange={ele => setSelectedDeckPath(ele.target.value)} className="mb-3">
          {
            decks.map(deck => <option key={deck.serialNumber} value={deck.path}>{deck.model} {deck.serialNumber}</option>)
          }
        </select>
        {
          selectedDeckPath ? <Deck deckPath={selectedDeckPath} /> : <></>
        }
      </div>
      <div className="col-4">
        Properties
      </div>
    </div>
  );
}
