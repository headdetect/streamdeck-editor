import React, { useMemo, useState, useCallback } from "react";
import { listStreamDecks, openStreamDeck } from "elgato-stream-deck";
import { first, isNil } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun } from "@fortawesome/free-solid-svg-icons";

import Deck from "./components/Deck";
import PropertiesTray from "./components/PropertiesTray";
import useConfig from "./hooks/useConfig";
import hexToRgb from "./utils/hexToRgb";

async function updateStreamDeck(device, config) {
  const buttons = config?.buttons || [];
  const brightness = config?.brightness || 70;

  device.setBrightness(brightness);

  for (const button of buttons) {
    const { index, style } = button || {};

    if (isNil(index)) {
      // TODO: Show notification
      console.log("Malformed button config");
      continue;
    }

    if (style?.background) {
      const color = hexToRgb(style.background);
      device.fillColor(index, color.r, color.g, color.b);
    }
  }
}

export default function App() {
  const decks = listStreamDecks();

  const primary = first(decks);

  const [selectedDeckInfo, setSelectedDeckInfo] = useState(primary);
  const [selectedButton, setSelectedButton] = useState(null);

  if (!selectedDeckInfo) {
    return (
      <div className="m-5">
        <h1 className="text-white">No stream deck found</h1>
      </div>
    );
  }

  const [config, setConfig] = useConfig(selectedDeckInfo.serialNumber);
  const device = useMemo(() => openStreamDeck(selectedDeckInfo.path), [selectedDeckInfo.path]);

  updateStreamDeck(device, config).catch(e => {
    // TODO: Show error if can't update

    console.log(e);
  });

  const buttonSelected = buttonIndex => {
    setSelectedButton(buttonIndex);
  };

  const updateBrightness = event => {
    const value = event?.target?.value || 70;

    setConfig({
      brightness: value,
    });
  };

  const propertyChanged = updatedConfig => {
    console.log("App.js", updatedConfig);

    setConfig(updatedConfig);
  };

  return (
    <div className="row h-100 p-4">
      <div className="col-8">
        <div className="row mb-3">
          <div className="col">

            <select onChange={ele => setSelectedDeckInfo(decks.find(d => d.serialNumber === ele.target.value))} className="mb-3">
              {
                decks.map(deck => <option key={deck.serialNumber} value={deck.serialNumber}>{deck.model} {deck.serialNumber}</option>)
              }
            </select>
          </div>
          <div className="col">
            <div className="row brightness">
              <div className="col-1">
                <FontAwesomeIcon icon={faSun} transform="shrink-6" />
              </div>
              <div className="col">
                <input type="range" className="form-range" onChange={updateBrightness} value={config?.brightness || 70} />
              </div>
              <div className="col-1">
                <FontAwesomeIcon icon={faSun} />
              </div>
            </div>
          </div>
        </div>

        <Deck rows={device.KEY_ROWS} columns={device.KEY_COLUMNS} onButtonSelected={buttonSelected} selectedButton={selectedButton} configs={config} />
      </div>
      <div className="col-4">
        {
          selectedButton !== null
            ? <PropertiesTray buttonIndex={selectedButton} configs={config} onPropertyChange={propertyChanged} />
            : <></>
        }
      </div>
    </div>
  );
}
