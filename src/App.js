import React, { useMemo, useState, useRef } from "react";
import { listStreamDecks, openStreamDeck } from "elgato-stream-deck";
import { first, isNil } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun } from "@fortawesome/free-solid-svg-icons";
import fs from "fs";

import Deck from "./components/Deck";
import PropertiesTray from "./components/PropertiesTray";
import useConfig from "./hooks/useConfig";
import hexToRgb from "./utils/hexToRgb";

async function loadDeviceConfig(device, config) {
  const timeoutRef = useRef(0);

  const imageRef = useRef({});
  const gifRef = useRef({});
  const colorRef = useRef({});

  const buttons = config?.buttons || [];
  const brightness = config?.brightness || 70;

  device.setBrightness(brightness);

  if (timeoutRef.current === 0) {
    clearInterval(timeoutRef.current);

    timeoutRef.current = 0;
  }

  for (const button of buttons) {
    const { index, style } = button || {};

    if (isNil(index)) {
      console.log("Config is invalid");
      continue;
    }

    if (style?.background?.image) {
      // Open up the raw file version of the saved image //
      if (style.background.image.endsWith(".gif")) {
        const raw = fs.readFileSync(`./data/${style.background.image}`);
        const frames = gif
        gifRef.current = { ...gifRef.current, [index]: { frames, index: 0 } };
      } else {
        const raw = fs.readFileSync(`./data/${style.background.image}.raw`);
        imageRef.current = { ...imageRef.current, [index]: raw };
      }
    } else if (style?.background?.color) {
      const color = hexToRgb(style.background.color);
      colorRef.current = { ...colorRef.current, [index]: color };
    }
  }

  timeoutRef.current = setInterval(() => {
    const { current: images } = imageRef;
    const { current: colors } = colorRef;
    const { current: gifs } = gifRef;

    for (let i = 0; i < buttons.length; i++) {
      const { index } = buttons[i];

      if (images.hasOwnProperty(index)) {
        device.fillImage(index, images[index], { format: "rgba" });
      } else if (colors.hasOwnProperty(index)) {
        const { r, g, b } = colors[index];
        device.fillImage(index, r, g, b);
      } else if (gifs.hasOwnProperty(index)) {
        const { raw, index: frameIndex } = gifs[index];


        device.fillImage();

        gifRef.current[index].index++;
      }
    }
  }, 5);
}

export default function App() {
  if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
  }

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

  loadDeviceConfig(device, config).catch(e => {
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
