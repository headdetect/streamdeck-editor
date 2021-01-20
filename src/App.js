import React, { useMemo, useState } from "react";
import { listStreamDecks, openStreamDeck } from "elgato-stream-deck";
import { first, isNil } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun } from "@fortawesome/free-solid-svg-icons";
import fs from "fs";
import omggif from "omggif";

import Deck from "./components/Deck";
import PropertiesTray from "./components/PropertiesTray";
import useConfig from "./hooks/useConfig";
import hexToRgb from "./utils/hexToRgb";

const gifIndexes = {};

const drawGif = ({ device, index, gifReader, framesElapsed }) => {
  const frameNum = framesElapsed % gifReader.numFrames();
  const info = gifReader.frameInfo(frameNum);

  const pixels = [];
  gifReader.decodeAndBlitFrameBGRA(frameNum, pixels);

  const pixelBuffer = Buffer.alloc(96 * 96 * 4, 0);

  pixelBuffer.fill(new Uint8Array(pixels));

  device.fillImage(index, pixelBuffer, { format: "bgra" });

  gifIndexes[index] = setTimeout(drawGif, info.delay * 5, { device, index, gifReader, framesElapsed: framesElapsed + 1 });
};

async function loadDeviceConfig(device, config) {
  const buttons = config?.buttons || [];
  const brightness = config?.brightness || 70;

  device.setBrightness(brightness);

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
        const gifReader = new omggif.GifReader(raw);

        // Clear previous ones //
        if (gifIndexes.hasOwnProperty(index) && gifIndexes[index] !== 0) {
          clearTimeout(gifIndexes[index]);
        }

        const gifMeta = {
          device,
          index,
          gifReader,
          framesElapsed: 0,
        };

        gifIndexes[index] = 0;
        setTimeout(drawGif, 1, gifMeta); // Wait until the previous was cleared //
      } else {
        const raw = fs.readFileSync(`./data/${style.background.image}.raw`);

        device.fillImage(index, raw, { format: "rgba" });
      }
    } else if (style?.background?.color) {
      const { r, g, b } = hexToRgb(style.background.color);
      device.fillImage(index, r, g, b);
    }
  }
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
