import React from "react";
import * as PropTypes from "prop-types";
import path from "path";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRecycle, faItalic, faBold } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import clsx from "clsx";
import useButtonConfig from "../hooks/useButtonConfig";
import { commands } from "../commands/commands";
import { saveRaw } from "../utils/image";

import "../assets/scss/components/PropertiesTray.scss";
import DeckButton from "./DeckButton";
import store from "../store/store";
import { setActiveButtonIndex } from "../store/actions";

const { dialog } = require("electron").remote;

const PropertiesTray = ({ onPropertyChange }) => {
  const config = useSelector(state => state.deck.config);
  const selectedButtonIndex = useSelector(state => state.deck.activeButtonIndex);
  const deviceProperties = useSelector(state => state.device.deviceProperties);

  const {
    currentButtonConfig,

    updateBackgroundColor,
    updateBackgroundImage,
    updateText,
    updateFontSize,
    updateFontProperties,
    updateCommand,
    updatePayload,

    reset,
  } = useButtonConfig(config, selectedButtonIndex, onPropertyChange);

  const { style, command: commandName, payload } = currentButtonConfig;

  const openFileUploadDialog = async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Images", extensions: ["jpg", "png", "gif"] }],
    });

    const [imagePath] = result.filePaths;
    const size = deviceProperties.ICON_SIZE;

    const fileName = `${path.basename(imagePath)}`;

    // Save with proper format //
    await saveRaw(imagePath,
      fileName.endsWith(".gif")
        ? `./data/${fileName}`
        : `./data/${fileName}.raw`,
      currentButtonConfig?.style?.background?.color, size);

    updateBackgroundImage(fileName);
  };

  const closeTray = () => {
    store.dispatch(setActiveButtonIndex(null));
  }

  const textProperties = style?.text?.properties;

  return (
    <div className="propertiesTray">
      <div className="pt-3 px-3">
        <div className="row">
          <div className="col">
            <button type="button" className="btn btn-danger" onClick={reset}>
              <FontAwesomeIcon icon={faRecycle} fixedWidth /> Reset
            </button>
          </div>

          <div className="col text-right">
            <button type="button" className="btn-close btn-close-white float-end" aria-label="Close" onClick={closeTray} />
          </div>
        </div>
      </div>
      <div className="pt-3 px-3">
        <label htmlFor="backgroundColor" className="form-label">Background</label>

        <div className="row">
          <div className="col-4">
            <DeckButton size={deviceProperties.ICON_SIZE} buttonConfig={currentButtonConfig} onSelected={openFileUploadDialog} selected={false} />
          </div>
          <div className="col">
            <input type="color" className="form-control form-control-lg form-control-color mb-2" id="backgroundColor" value={style?.background?.color || "#000000"} title="Choose your color" onChange={updateBackgroundColor} />
            <input type="text" className="form-control form-control-sm" id="backgroundColorText" value={style?.background?.color || "#000000"} onChange={updateBackgroundColor} />
          </div>
        </div>
      </div>

      <div className="pt-3 px-3">
        <label className="form-label">Font Settings</label>
        <div className="row">
          <div className="col-4">
            <input type="number" className="form-control" id="foregroundFontSize" value={style?.text?.fontSize || 16} onChange={updateFontSize} />
          </div>
          <div className="col-8">
            <div className="btn-group me-2" role="group" aria-label="Second group">
              <button
                type="button"
                className={clsx("btn btn-secondary", { "active": Boolean(textProperties?.includes("italic")) })}
                onClick={() => updateFontProperties("italic")}
              >
                <FontAwesomeIcon icon={faItalic} fixedWidth />
              </button>
              <button
                type="button"
                className={clsx("btn btn-secondary", { "active": Boolean(textProperties?.includes("bold")) })}
                onClick={() => updateFontProperties("bold")}
              >
                <FontAwesomeIcon icon={faBold} fixedWidth />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-1 px-3">
        <label htmlFor="backgroundColor" className="form-label">Text</label>
        <textarea className="form-control form-control-lg" id="foregroundText" value={style?.text?.value || ""} onChange={updateText} />
      </div>

      <div className="pt-3 px-3">
        <label htmlFor="function" className="form-label">Function</label>

        <select className="form-control" onChange={updateCommand} value={commandName}>
          {
            Object.keys(commands)
              .map(cmd => <option key={cmd} value={cmd}>{cmd}</option>)
          }
        </select>
      </div>
      <div className="pt-3 px-3">
        {
          commandName
            && commands.hasOwnProperty(commandName)
            && commands[commandName].hasOwnProperty("getOptionsComponent")
            && commands[commandName].getOptionsComponent(payload, updatePayload)
        }
      </div>
    </div>
  );
};

PropertiesTray.propTypes = {
  onPropertyChange: PropTypes.func.isRequired,
};

export default PropertiesTray;
