import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { listStreamDecks, openStreamDeck } from "elgato-stream-deck";
import { first } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun } from "@fortawesome/free-solid-svg-icons";
import fs from "fs";

import { useSelector } from "react-redux";
import setupStreamDeck from "./utils/device";
import Deck from "./components/Deck";
import PropertiesTray from "./components/PropertiesTray";
import store from "./store/store";

import {
  writeToConfig,
  setOnUpdateListener,
  clearAllListeners,
  getConfigFromFile,
} from "./utils/config";

import { setActiveButtonIndex, setConfig, setActiveDeviceInfo, setActiveDeviceProperties } from "./store/actions";
import { commands } from "./commands/commands";

export default function App() {
  if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
  }

  const deckDeviceInfos = listStreamDecks();

  const canvasRef = useRef(null);

  const selectedDeckInfo = useSelector(state => state.device.deviceInfo);
  const selectedDeckProperties = useSelector(state => state.device.deviceProperties);
  const config = useSelector(state => state.deck.config);
  const selectedButton = useSelector(state => state.deck.activeButtonIndex);

  const selectedDeckSerialNumber = selectedDeckInfo?.serialNumber;

  // Set store data on load //
  useEffect(() => {
    const primary = first(deckDeviceInfos);

    if (!primary) return;

    store.dispatch(setActiveDeviceInfo(primary));
    store.dispatch(setConfig(getConfigFromFile(primary.serialNumber)));
  }, []);

  const selectedDeck = useMemo(() => {
    if (selectedDeckInfo?.path) {
      return openStreamDeck(selectedDeckInfo.path);
    }

    return null;
  }, [selectedDeckInfo?.path]);

  const handleButtonPressed = useCallback(async (index) => {
    // Get command //
    const button = config.buttons?.find(butt => butt.index === index);

    if (!button) {
      // If we can't find button, just ignore //
      return;
    }

    const { command: commandName, payload } = button;

    if (!commandName || !payload) {
      return;
    }

    const command = commands[commandName];

    // Execute command w/payload //
    if (!command) {
      return;
    }

    console.log("Running command", commandName, payload);
    await command.runCommand(payload);
  }, [config]);

  const flashConfigToDevice = (newConfig) => {
    if (!canvasRef.current) return;

    setupStreamDeck(selectedDeck, newConfig, canvasRef.current, handleButtonPressed).catch(e => {
      // TODO: Show error if can't update

      console.log(e);
    });
  };

  useEffect(() => {
    if (!config || !selectedDeck) {
      return;
    }

    store.dispatch(setActiveDeviceProperties(selectedDeck.deviceProperties));
  }, [selectedDeck]); // We only want when a deck is changed, not when the config changes //

  const setCanvasRef = useCallback(ref => {
    if (ref && config) {
      canvasRef.current = ref;
      flashConfigToDevice(config);
    }
  }, [config]);

  if (!selectedDeckInfo) {
    return (
      <div className="m-5">
        <h1 className="text-white">No stream deck found</h1>
      </div>
    );
  }

  // TODO: Refactor this mess to not use listeners but something like a useEffect
  clearAllListeners();
  setOnUpdateListener(selectedDeckSerialNumber, newConfig => {
    console.log("New config. Reloading device", newConfig);
    store.dispatch(setConfig(newConfig));
    flashConfigToDevice(newConfig);
  });

  const handleButtonSelected = buttonIndex => {
    store.dispatch(setActiveButtonIndex(buttonIndex));
  };

  const handleDeckChanged = ele => {
    store.dispatch(setActiveDeviceInfo(deckDeviceInfos.find(d => d.serialNumber === ele.target.value)));
  };

  const updateBrightness = (event) => {
    const value = event?.target?.value || 70;

    writeToConfig(selectedDeckSerialNumber, {
      brightness: value,
    });
  };

  const propertyChanged = (updatedConfig) => {
    writeToConfig(selectedDeckSerialNumber, updatedConfig);
  };

  if (!selectedDeckInfo || !selectedDeckProperties) {
    return (
      <div className="m-5">
        <h1 className="text-white">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="container-fluid h-100">
      <div className="row h-100">
        <div className="d-none">
          {/* For use when rendering actual button bitmaps */}
          <canvas ref={setCanvasRef} />
        </div>
        <div className="col px-3 py-2">
          <div className="row my-3">
            <div className="col-4">
              <select className="form-select mb-3" onChange={handleDeckChanged}>
                {
                  deckDeviceInfos.map(deck => <option key={deck.serialNumber} value={deck.serialNumber}>{deck.model} {deck.serialNumber}</option>)
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

          <Deck onButtonSelected={handleButtonSelected} />
        </div>
        {
          selectedButton !== null && (
            <div className="col-4 h-100 overflow-auto">
              {
                <PropertiesTray onPropertyChange={propertyChanged} />
              }
            </div>
          )
        }
      </div>
    </div>
  );
}
