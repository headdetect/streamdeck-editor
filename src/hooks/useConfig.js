import { useState } from "react";

const fs = require("fs");

const defaultConfig = {
  brightness: 70,
  buttons: [
    {
      index: 7,
      style: {
        text: "Make Popup",
        background: "#80deea",
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
 * @param deckPath
 * @param fileName
 */
const useConfig = (deckPath, fileName = "config.json") => {
  const readFromFile = () => {
    if (!fs.existsSync(fileName)) {
      fs.writeFileSync(fileName, JSON.stringify(defaultConfig, null, 4));
    }

    return JSON.parse(fs.readFileSync(fileName).toString());
  };

  const [config, setConfig] = useState(readFromFile);

  // Update the state and persist on disk //
  const writeToConfig = (updatedConfigs, overwrite = false) => {
    if (overwrite) {
      fs.writeFileSync(fileName, JSON.stringify(updatedConfigs, null, 4));
      setConfig(updatedConfigs);
      return;
    }

    const newConfig = { config, ...updatedConfigs };

    fs.writeFileSync(fileName, JSON.stringify(newConfig, null, 4));
    setConfig(newConfig);
  };

  return [config, writeToConfig];
};

export default useConfig;
