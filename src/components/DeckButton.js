import React from "react";
import * as PropType from "prop-types";
import "./DeckButton.css";

const DeckButton = ({ keyCode, onSelected }) => {
  const keyName = `${keyCode}`;

  const handleClicked = event => {
    if (onSelected) {
      onSelected(event);
    }
  };

  return (
    <div className="deckButton">
      <button className="deckButtonContent" onClick={handleClicked} type="button">{keyName}</button>
    </div>
  );
};

DeckButton.propTypes = {
  keyCode: PropType.number.isRequired,
  onSelected: PropType.func,
};

DeckButton.defaultProps = {
  onSelected: () => {},
};

export default DeckButton;
