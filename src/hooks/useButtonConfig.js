import { merge } from "lodash";
import { useEffect, useState } from "react";
import clsx from "clsx";

export default function useButtonConfig(wholeConfig, buttonIndex, onPropertyChange) {
  const initialConfig = wholeConfig.buttons?.find(butt => butt?.index === buttonIndex) || {};

  const [currentButtonConfig, setCurrentButtonConfig] = useState(initialConfig);

  useEffect(() => {
    setCurrentButtonConfig(initialConfig);
  }, [buttonIndex]);

  const updateButtonConfig = newConfig => {
    const buttonConfigs = Object.assign([], wholeConfig.buttons || []); // Copy //
    const configIndex = wholeConfig.buttons.findIndex(butt => butt?.index === buttonIndex); // Find the index of this to update //
    let updatedFinalButtonConfig;

    if (configIndex === -1) {
      // This is a new config //

      updatedFinalButtonConfig = { index: buttonIndex, ...newConfig };
    } else {
      // Remove our old button config from the list //
      buttonConfigs.splice(configIndex, 1);

      updatedFinalButtonConfig = merge(currentButtonConfig, newConfig);
    }

    // We spread over a NEW object //
    setCurrentButtonConfig({ ...updatedFinalButtonConfig });

    onPropertyChange({
      buttons: [
        ...buttonConfigs, // All the old configs //
        updatedFinalButtonConfig, // Get overwritten by new configs //
      ],
    });
  };

  const { style } = currentButtonConfig;

  const updateBackgroundColor = event => {
    const color = event?.target?.value;

    updateButtonConfig({
      style: {
        ...style,
        background: { color },
      },
    });
  };

  const updateBackgroundImage = fileName => {
    updateButtonConfig({
      style: {
        ...style,
        background: { image: fileName },
      },
    });
  };

  const updateText = event => {
    const value = event?.target?.value;
    updateButtonConfig({
      style: {
        ...style,
        text: {
          value,
        },
      },
    });
  };

  const updateFontSize = event => {
    const fontSize = event?.target?.value;
    updateButtonConfig({
      style: {
        ...style,
        text: {
          fontSize,
        },
      },
    });
  };

  const updateFontProperties = action => {
    const text = style?.text?.properties || "";
    const previous = {
      bold: text.includes("bold"),
      italic: text.includes("italic"),
      underline: text.includes("underline"),
    };

    previous[action] = !previous[action];

    const stringified = clsx(previous);

    updateButtonConfig({
      style: {
        ...style,
        text: {
          properties: stringified,
        },
      },
    });
  };

  const updateCommand = event => {
    const command = event?.target?.value;

    updateButtonConfig({
      command,
    });
  };

  const updatePayload = payload => {
    updateButtonConfig({
      payload,
    });
  };

  const reset = () => {
    const buttonConfigs = Object.assign([], wholeConfig.buttons || []); // Copy //
    const configIndex = wholeConfig.buttons.findIndex(butt => butt?.index === buttonIndex); // Find the index of this to remove //

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

  return {
    currentButtonConfig,

    updateBackgroundColor,
    updateBackgroundImage,
    updateText,
    updateFontSize,
    updateFontProperties,
    updateCommand,
    updatePayload,

    reset,
  };
}
