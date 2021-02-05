import React from "react";
import * as PropTypes from "prop-types";
import { merge } from "lodash";
import path from "path";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRecycle } from "@fortawesome/free-solid-svg-icons";
import { commands } from "../commands/commands";
import { saveRaw } from "../utils/image";

import "../assets/scss/components/PropertiesTray.scss";
import DeckButton from "./DeckButton";

const { dialog } = require("electron").remote;

const PropertiesTray = ({ device, buttonIndex, configs, onPropertyChange }) => {
  const buttonConfig = configs.buttons?.find(butt => butt?.index === buttonIndex) || {};
  const { style, command: commandName, payload } = buttonConfig;

  const updateButtonConfig = newConfigs => {
    const buttonConfigs = Object.assign([], configs.buttons || []); // Copy //
    const configIndex = configs.buttons.findIndex(butt => butt?.index === buttonIndex); // Find the index of this to update //

    if (configIndex === -1) {
      // This is a new config //

      onPropertyChange({
        buttons: [
          ...buttonConfigs,
          { index: buttonIndex, ...newConfigs },
        ],
      });
    } else {
      const newCombinedConfig = merge(buttonConfig, newConfigs);

      // Remove our old button config from the list //
      buttonConfigs.splice(configIndex, 1);

      onPropertyChange({
        buttons: [
          ...buttonConfigs,
          newCombinedConfig,
        ],
      });
    }
  };

  const reset = () => {
    const buttonConfigs = Object.assign([], configs.buttons || []); // Copy //
    const configIndex = configs.buttons.findIndex(butt => butt?.index === buttonIndex); // Find the index of this to remove //

    if (configIndex === -1) {
      return; // It was never saved in the first place //
    }

    // Remove our old button config from the list //
    buttonConfigs.splice(configIndex, 1);

    // Send update without the current config //
    onPropertyChange({
      buttons: [
        ...buttonConfigs,
      ],
    });
  };

  const updateBackgroundColor = event => {
    const color = event?.target?.value;

    updateButtonConfig({
      style: {
        background: { color },
      },
    });
  };

  const updateCommand = event => {
    const command = event?.target?.value;

    updateButtonConfig({
      command,
    });
  };

  const updatePayload = updatedPayload => {
    updateButtonConfig({
      payload: updatedPayload,
    });
  };

  const openFileUploadDialog = async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Images", extensions: ["jpg", "png", "gif"] }],
    });

    const [imagePath] = result.filePaths;
    const size = device.ICON_SIZE;

    const fileName = `${path.basename(imagePath)}`;

    // Save with proper format //
    await saveRaw(imagePath,
      fileName.endsWith(".gif")
        ? `./data/${fileName}`
        : `./data/${fileName}.raw`,
      buttonConfig?.style?.background?.color, size);

    updateButtonConfig({
      style: {
        background: { image: fileName },
      },
    });
  };

  const commandies = commandName;

  return (
    <div className="propertiesTray">
      <div className="pt-3 px-3">
        <button type="button" className="btn btn-danger" onClick={reset}>
          <FontAwesomeIcon icon={faRecycle} fixedWidth /> Reset
        </button>
      </div>
      <div className="pt-3 px-3">
        <label htmlFor="backgroundColor" className="form-label">Background</label>

        <div className="row">
          <div className="col-6">
            <DeckButton index={0} buttonConfig={buttonConfig} onSelected={openFileUploadDialog} selected={false} />
          </div>
          <div className="col">
            <input type="color" className="form-control form-control-lg form-control-color" id="backgroundColor" value={style?.background?.color || "#000000"} title="Choose your color" onChange={updateBackgroundColor} />
          </div>
        </div>
      </div>
      <div className="pt-3 px-3">
        <label htmlFor="function" className="form-label">Function</label>

        <select className="form-control" onChange={updateCommand}>
          {
            Object.keys(commands)
              .map(cmd => <option key={cmd}>{cmd}</option>)
          }
        </select>
      </div>
      <div className="pt-3 px-3">
        {
          commandName
          && commands.hasOwnProperty(commandName)
          && commands[commandName].hasOwnProperty("getOptions")
            ? commands[commandName].getOptions()
            : <></>
        }
      </div>
    </div>
  );
};

PropertiesTray.propTypes = {
  buttonIndex: PropTypes.number,
  configs: PropTypes.shape().isRequired,
  onPropertyChange: PropTypes.func.isRequired,
  device: PropTypes.shape().isRequired,
};

PropertiesTray.defaultProps = {
  buttonIndex: null,
};

export default PropertiesTray;
