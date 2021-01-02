import React, { useRef } from "react";
import * as PropTypes from "prop-types";
import "../assets/scss/components/PropertiesTray.scss";
import sharp from "sharp";
import DeckButton from "./DeckButton";

const { dialog } = require("electron").remote;

const PropertiesTray = ({ buttonIndex, configs, onPropertyChange }) => {
  const buttonConfig = configs.buttons?.find(butt => butt?.index === buttonIndex) || {};

  const uploadFormRef = useRef();

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
      const newCombinedConfig = {
        ...buttonConfig, ...newConfigs,
      };

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

  const updateBackgroundImage = event => {
    const image = event?.target?.value;

    updateButtonConfig({
      style: {
        background: { image },
      },
    });
  };

  const openFileUploadDialog = async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Images", extensions: ["jpg", "png", "gif"] }],
    });

    const [imagePath] = result.filePaths;

    // Max supported image size: https://github.com/julusian/node-elgato-stream-deck#fill-image //
    const size = 96;
    const image = sharp(imagePath);
    const stats = await image.stats();

    console.log(stats);
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
};

PropertiesTray.defaultProps = {
  buttonIndex: null,
};

export default PropertiesTray;
