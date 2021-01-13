import React, { useRef } from "react";
import * as PropTypes from "prop-types";
import { merge } from "lodash";
import path from "path";
import fs from "fs";
import { resizeImage, saveRaw } from "../utils/image";

import "../assets/scss/components/PropertiesTray.scss";
import DeckButton from "./DeckButton";

const { dialog } = require("electron").remote;

const PropertiesTray = ({ device, buttonIndex, configs, onPropertyChange }) => {
  const buttonConfig = configs.buttons?.find(butt => butt?.index === buttonIndex) || {};
  const { style, command, payload } = buttonConfig;

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

  const updateBackgroundColor = event => {
    const color = event?.target?.value;

    updateButtonConfig({
      style: {
        background: { color },
      },
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

  return (
    <div className="propertiesTray">
      <div className="pt-3 px-3">
        <label htmlFor="backgroundColor" className="form-label">Background</label>

        <div className="row">
          <div className="col-6">
            <DeckButton index={0} buttonConfig={buttonConfig} onSelected={openFileUploadDialog} selected={false} />
          </div>
          <div className="col">
            <input type="color" className="form-control form-control-lg form-control-color" id="backgroundColor" value={style?.background?.color} title="Choose your color" onChange={updateBackgroundColor} />
          </div>
        </div>
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
