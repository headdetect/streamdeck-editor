import React from "react";
import * as PropType from "prop-types";
import classnames from "classnames";
import "../assets/scss/components/DeckButton.scss";

const DeckButton = ({ index, buttonConfig, onSelected, selected }) => {
  const handleClicked = () => {
    if (onSelected) {
      onSelected(index);
    }
  };

  return (
    <div className="deckButton">
      <button className={classnames("deckButtonContent", { selected })} onClick={handleClicked} type="button" style={{ backgroundColor: buttonConfig?.style?.background || "#252525" }}>
        {
          buttonConfig
            ? <span>()</span>
            : <></>
        }
      </button>
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
