import React, { useMemo, useState } from "react";
import { listStreamDecks, openStreamDeck } from "elgato-stream-deck";
import { first, isNil } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun } from "@fortawesome/free-solid-svg-icons";
import Jimp from "jimp";
import fs from "fs";

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

    if (style?.background?.image) {
      // Image go here //

      const image = await Jimp.read(style.background.image);

      const compositeImage = await new Promise((res, rej) => {
        new Jimp(device.ICON_SIZE, device.ICON_SIZE, style.background.color || "#000000", (err, jimpImage) => {
          if (err) {
            rej(err);
            return;
          }

          res(jimpImage);
        });
      });

      compositeImage
        .quality(100)
        .composite(image, 0, 0);

      const rawBuffer = Buffer.alloc(device.ICON_SIZE * device.ICON_SIZE * 3);
      const compositeBuffer = compositeImage.bitmap.data;

      // Because Jimp will always have the alpha channel included,
      // we need to strip it and I for the life of me cannot find
      // a proper way to strip it out, so we're going to create a new
      // buffer and copy it over sans-alpha channel.
      let r = 0;
      for (let i = 0; i < compositeBuffer.length; i++) {
        if (i % 4 === 3) {
          continue;
        }

        rawBuffer[r++] = compositeBuffer[i];
      }

      device.fillImage(index, rawBuffer);
    } else if (style?.background?.color) {
      const color = hexToRgb(style.background.color);
      device.fillColor(index, color.r, color.g, color.b);
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
