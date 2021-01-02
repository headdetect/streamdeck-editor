import React from "react";
import * as PropType from "prop-types";
import classnames from "classnames";
import "../assets/scss/components/DeckButton.scss";

const transparentImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const DeckButton = ({ index, buttonConfig, onSelected, selected }) => {
  const handleClicked = () => {
    if (onSelected) {
      onSelected(index);
    }
  };

  const style = {};

  if (buttonConfig?.style?.background?.color) {
    style.backgroundColor = buttonConfig.style.background.color;
  }

  const src = buttonConfig?.style?.background?.image || transparentImage;

  return (
    <div className="deckButton">
      <img src={src} className={classnames("deckButtonContent", { selected })} onClick={handleClicked} style={style} alt="alt" />
    </div>
  );
};

DeckButton.propTypes = {
  index: PropType.number.isRequired,
  buttonConfig: PropType.shape(),
  onSelected: PropType.func,
  selected: PropType.bool,
};

DeckButton.defaultProps = {
  onSelected: () => {},
  selected: false,
  buttonConfig: null,
};

export default DeckButton;
