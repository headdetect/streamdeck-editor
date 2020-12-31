import React from "react";
import * as PropType from "prop-types";
import classnames from "classnames";
import "../assets/scss/components/DeckButton.scss";
import useConfig from "../hooks/useConfig";

const DeckButton = ({ index, onSelected, selected }) => {
  const [config] = useConfig();

  const buttonConfig = config?.buttons?.find(b => b.index === index);

  const handleClicked = () => {
    if (onSelected) {
      onSelected(index);
    }
  };

  return (
    <div className="deckButton">
      <button className={classnames("deckButtonContent", { selected })} onClick={handleClicked} type="button">
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
  onSelected: PropType.func,
  selected: PropType.bool,
};

DeckButton.defaultProps = {
  onSelected: () => {},
  selected: false,
};

export default DeckButton;
