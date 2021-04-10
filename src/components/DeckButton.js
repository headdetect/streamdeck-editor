import React, { useEffect, useRef, useState } from "react";
import * as PropType from "prop-types";
import clsx from "clsx";
import "../assets/scss/components/DeckButton.scss";
import drawConfig from "../utils/drawing";
import { useSelector } from "react-redux";

const DeckButton = ({ size, buttonConfig, onSelected, selected }) => {
  const canvasRef = useRef(null);
  const selectedButtonIndex = useSelector(state => state.deck.activeButtonIndex);

  const buttonContainerRef = useRef(null);
  const [buttonContainerSize, setButtonContainerSize] = useState(0);

  useEffect(() => {
    const handleResize = () =>
      setButtonContainerSize((buttonContainerRef.current?.offsetWidth || 0));

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    }
  }, [buttonContainerRef.current, selectedButtonIndex]); // Listen for selectedButton changes, that's when the property tray opens/closes //


  useEffect(() => {
    if (!canvasRef.current || !buttonConfig) {
      return;
    }

    canvasRef.current.width = size * 2;
    canvasRef.current.height = size * 2;

    const context = canvasRef.current.getContext("2d");

    // Just for the purpose of rendering on screen, we're going to say its 2x the actual size //
    context.translate(-size, -size);
    context.scale(2, 2);

    drawConfig(context, buttonConfig);
  }, [canvasRef, buttonConfig]);

  return (
    <div className="deckButton" onClick={() => onSelected && onSelected()} ref={buttonContainerRef} style={{ height: buttonContainerSize }}>
      <canvas ref={canvasRef} className={clsx("deckButtonContent", { selected })} />
    </div>
  );
};

DeckButton.propTypes = {
  size: PropType.number.isRequired,
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
