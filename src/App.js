import React, { useMemo, useState } from "react";
import { listStreamDecks, openStreamDeck } from "elgato-stream-deck";
import { first } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun } from "@fortawesome/free-solid-svg-icons";
import fs from "fs";

import loadDeviceConfig from "./utils/device";
import Deck from "./components/Deck";
import PropertiesTray from "./components/PropertiesTray";

import {
  writeToConfig,
  setOnUpdateListener,
  clearAllListeners,
  getConfig,
} from "./utils/config";

export default function App() {
  if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
  }

  const decks = listStreamDecks();

  const primary = first(decks);

  const [selectedDeckInfo, setSelectedDeckInfo] = useState(primary);
  const [selectedButton, setSelectedButton] = useState(null);

  const selectedDeckSerialNumber = selectedDeckInfo.serialNumber;

  const [config, setConfigState] = useState(getConfig(selectedDeckSerialNumber));

  if (!selectedDeckInfo) {
    return (
      <div className="m-5">
        <h1 className="text-white">No stream deck found</h1>
      </div>
    );
  }

  const device = useMemo(() => openStreamDeck(selectedDeckInfo.path), [selectedDeckInfo.path]);

  clearAllListeners();
  setOnUpdateListener(selectedDeckSerialNumber, newConfig => {
    console.log("New config. Reloading device", newConfig);
    setConfigState(newConfig);

    loadDeviceConfig(device, newConfig).catch(e => {
      // TODO: Show error if can't update

      console.log(e);
    });
  });

  useMemo(() => {
    console.log("Should only be called once");
    loadDeviceConfig(device, config).catch(e => {
      // TODO: Show error if can't update

      console.log(e);
    });
  }, []);

  const buttonSelected = buttonIndex => {
    setSelectedButton(buttonIndex);
  };

  const updateBrightness = event => {
    const value = event?.target?.value || 70;

    writeToConfig(selectedDeckSerialNumber, {
      brightness: value,
    });
  };

  const propertyChanged = updatedConfig => {
    writeToConfig(selectedDeckSerialNumber, updatedConfig);
  };

  return (
    <div className="row h-100 px-3">
      <div className="col-8">
        <div className="row my-3">
          <div className="col-4">
            <select className="form-select mb-3" onChange={ele => setSelectedDeckInfo(decks.find(d => d.serialNumber === ele.target.value))}>
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

        <Deck device={device} onButtonSelected={buttonSelected} selectedButton={selectedButton} configs={config} />
      </div>
      <div className="col-4">
        {
          selectedButton !== null
            ? <PropertiesTray device={device} buttonIndex={selectedButton} configs={config} onPropertyChange={propertyChanged} />
            : <></>
        }
      </div>
    </div>
  );
}
