import { isNil } from "lodash";
import fs from "fs";
import omggif from "omggif";
import drawConfig from "./drawing";
import { commands } from "../commands/commands";

const drawingIndexes = {};
const resetIndexes = {};
let buttonHandlerAttached = false;

const drawGif = ({ device, index, gifReader, framesElapsed }) => {
  if (resetIndexes.hasOwnProperty(index)) {
    return;
  }

  const { ICON_SIZE } = device;
  const proposedImageSize = ICON_SIZE * ICON_SIZE * 4;
  const frameNum = framesElapsed % gifReader.numFrames();
  const info = gifReader.frameInfo(frameNum);

  const pixels = [];
  gifReader.decodeAndBlitFrameBGRA(frameNum, pixels);

  let pixelBuffer;

  if (pixels.length === proposedImageSize) {
    pixelBuffer = Buffer.from(pixels);
  } else {
    pixelBuffer = Buffer.alloc(proposedImageSize);
    pixelBuffer.fill(new Uint8Array(pixels));
  }

  device.fillImage(index, pixelBuffer, { format: "bgra" }); // TODO: Use canvas

  drawingIndexes[index] = setTimeout(drawGif, info.delay * 5, { device, index, gifReader, framesElapsed: framesElapsed + 1 });
};

const initGifDrawSequence = (device, index, image) => {
  const raw = fs.readFileSync(`./data/${image}`);
  const gifReader = new omggif.GifReader(raw);

  // Clear previous ones //
  if (drawingIndexes.hasOwnProperty(index)) {
    clearTimeout(drawingIndexes[index]);
    delete drawingIndexes[index];
  }

  const gifMeta = {
    device,
    index,
    gifReader,
    framesElapsed: 0,
  };

  // eslint-disable-next-line no-return-assign
  setTimeout(() => resetIndexes[index] = true, 10); // Reset any that may be running //
  setTimeout((info) => {
    delete resetIndexes[index];
    drawGif(info);
  }, 100, gifMeta); // Wait until the previous was cleared //
};

const setButtonGraphics = async (device, canvasContext, button) => {
  const { index, style } = button;

  // TODO: Move to the drawing util
  if (style?.background?.image?.endsWith(".gif")) {
    initGifDrawSequence(device, index, style.background.image);
    return;
  }

  if (style) {
    const { width: canvasWidth, height: canvasHeight } = canvasContext.canvas;

    drawConfig(canvasContext, button);

    const pixels = canvasContext.getImageData(0, 0, canvasWidth, canvasHeight);
    const buffer = Buffer.from(pixels.data.buffer); // Get NodeJs Buffer from ArrayBuffer //
    device.fillImage(index, buffer, { format: "rgba" });
  } else {
    device.clearKey(index);
  }
};

const setupStreamDeck = async (device, config, canvas, onButtonPressed) => {
  const buttons = config?.buttons || [];
  const brightness = config?.brightness || 70;

  device.clearAllKeys();
  device.setBrightness(brightness);

  if (!buttonHandlerAttached) {
    device.on("up", onButtonPressed);
    buttonHandlerAttached = true;
  }

  // Clear gif timeouts //
  Object.keys(drawingIndexes).forEach(index => clearInterval(drawingIndexes[index]));

  const { ICON_SIZE } = device;

  // Create a canvas that all our buttons can use to draw things //
  const canvasContext = canvas.getContext("2d");
  canvasContext.canvas.width = ICON_SIZE;
  canvasContext.canvas.height = ICON_SIZE;

  for (const button of buttons) {
    const { index } = button || {};

    if (isNil(index)) {
      console.log("Config is invalid");
      continue;
    }

    await setButtonGraphics(device, canvasContext, button);
    canvasContext.clearRect(0, 0, ICON_SIZE, ICON_SIZE); // Clear so the next button doesn't get garbage //
  }
};

export default setupStreamDeck;
