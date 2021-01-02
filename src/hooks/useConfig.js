import { useState } from "react";

const fs = require("fs");

const defaultConfig = {
  version: "1",
  brightness: 70,
  buttons: [
    {
      index: 7,
      style: {
        text: "Make Popup",
        background: {
          color: "#80deea",
        },
      },
      command: "execute",
      payload: {
        cmd: "notify-send \"sup guy\" \"This be a message\"",
      },
    },
  ],
};

/**
 * Hook to get the current active configurations.
 * @param deckSerialNumber
 */
const useConfig = (deckSerialNumber) => {
  if (!deckSerialNumber) {
    // eslint-disable-next-line no-throw-literal
    throw "Deck serial number must be set";
  }

  const fileName = `${deckSerialNumber}.config.json`;

  if (!fs.existsSync(fileName)) {
    fs.writeFileSync(fileName, JSON.stringify(defaultConfig, null, 4));
  }

  const rawConfig = JSON.parse(fs.readFileSync(fileName).toString());
  const [config, setConfig] = useState(rawConfig);

  // Update the state and persist on disk //
  const writeToConfig = (updatedConfigs, overwrite = false) => {
    if (overwrite) {
      fs.writeFileSync(fileName, JSON.stringify(updatedConfigs, null, 4)); // TODO: Do this async
      setConfig(updatedConfigs);
      return;
    }

    const newConfig = { ...rawConfig, ...updatedConfigs };

    fs.writeFileSync(fileName, JSON.stringify(newConfig, null, 4)); // TODO: Do this async
    setConfig(newConfig);
  };

  return [config, writeToConfig];
};

export default useConfig;
