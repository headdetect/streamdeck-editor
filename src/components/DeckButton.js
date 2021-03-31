import React, { useEffect, useRef, useState } from "react";
import * as PropType from "prop-types";
import classnames from "classnames";
import "../assets/scss/components/DeckButton.scss";
import drawConfig from "../utils/drawing";

const DeckButton = ({ size, buttonConfig, onSelected, selected }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState(0);

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

  useEffect(() => {
    setContainerSize(containerRef.current?.clientWidth);
  });

  return (
    <div className="deckButton" ref={containerRef} style={{ height: containerSize }} onClick={() => onSelected && onSelected()}>
      <canvas ref={canvasRef} className={classnames("deckButtonContent", { selected })} />
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
