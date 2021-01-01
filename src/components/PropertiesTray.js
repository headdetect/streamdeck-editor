import React, { useState } from "react";
import * as PropTypes from "prop-types";
import { debounce } from "lodash";
import "../assets/scss/components/PropertiesTray.scss";

const PropertiesTray = ({ buttonIndex, configs, onPropertyChange }) => {
  const buttonConfig = configs.buttons?.find(butt => butt?.index === buttonIndex);

  const [trayConfig, setTrayConfig] = useState(buttonConfig || {});

  const { style, command, payload } = trayConfig;

  const updateButtonConfig = newConfigs => {
    const buttonConfigs = Object.assign([], configs.buttons || []); // Copy //
    const configIndex = configs.buttons.findIndex(butt => butt?.index === buttonIndex); // Find the index of this to update //

    setTrayConfig({
      ...trayConfig,
      ...newConfigs,
    });

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
        background: color,
      },
    });
  };

  return (
    <div className="propertiesTray">
      <div className="mb-3">
        <label htmlFor="backgroundColor" className="form-label">Background Color</label>
        <input type="color" className="form-control form-control-color" id="backgroundColor" value={style?.background || "#ff0000"} title="Choose your color" onChange={updateBackgroundColor} />
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
