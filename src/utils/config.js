import { debounce } from "lodash";

const fs = require("fs");

const defaultConfig = {
  version: "1",
  brightness: 70,
  buttons: [],
};

const getFileFromSerial = deckSerialNumber => `./data/${deckSerialNumber}.config.json`;

let listeners = [];

/**
 * Hook to get the current active configurations.
 * @param deckSerialNumber
 */
const getConfigFromFile = (deckSerialNumber) => {
  if (!deckSerialNumber) {
    // eslint-disable-next-line no-throw-literal
    throw "Deck serial number must be set";
  }

  const fileName = getFileFromSerial(deckSerialNumber);

  if (!fs.existsSync(fileName)) {
    fs.writeFileSync(fileName, JSON.stringify(defaultConfig, null, 4));
  }

  return JSON.parse(fs.readFileSync(fileName).toString());
};

const clearListener = (num) => {
  if (!listeners.hasOwnProperty(num)) return;

  listeners.splice(num);
};

const clearAllListeners = () => {
  listeners = [];
};

const setOnUpdateListener = (deckSerialNumber, callback) => listeners.push({ deckSerialNumber, callback });

const flashUpdate = () => {
  const configCache = { };
  for (const listener of listeners) {
    const { deckSerialNumber, callback } = listener;

    if (!configCache.hasOwnProperty(deckSerialNumber)) {
      configCache[deckSerialNumber] = getConfigFromFile(deckSerialNumber);
    }

    callback(configCache[deckSerialNumber]);
  }
};

// Update the state and persist on disk //
const writeToConfigPure = (deckSerialNumber, updatedConfigs, overwrite = false) => {
  const fileName = getFileFromSerial(deckSerialNumber);
  const rawConfig = getConfigFromFile(deckSerialNumber);

  if (overwrite) {
    fs.writeFile(fileName, JSON.stringify(updatedConfigs, null, 4), flashUpdate);
    return;
  }

  const newConfig = { ...rawConfig, ...updatedConfigs };

  fs.writeFile(fileName, JSON.stringify(newConfig, null, 4), flashUpdate);
};

const writeToConfig = debounce(writeToConfigPure, 400);

export {
  writeToConfig,
  setOnUpdateListener,
  clearListener,
  getConfigFromFile,
  defaultConfig,
  clearAllListeners,
};
