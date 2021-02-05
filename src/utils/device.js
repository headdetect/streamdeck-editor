import { isNil } from "lodash";
import fs from "fs";
import omggif from "omggif";
import hexToRgb from "./hexToRgb";

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

  device.fillImage(index, pixelBuffer, { format: "bgra" });

  drawingIndexes[index] = setTimeout(drawGif, info.delay * 5, { device, index, gifReader, framesElapsed: framesElapsed + 1 });
};

const setButtonBackground = (device, { index, style }) => {
  if (style?.background?.image) {
    // Open up the raw file version of the saved image //
    if (style.background.image.endsWith(".gif")) {
      const raw = fs.readFileSync(`./data/${style.background.image}`);
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
    } else {
      const raw = fs.readFileSync(`./data/${style.background.image}.raw`);

      device.fillImage(index, raw, { format: "rgba" });
    }
  } else if (style?.background?.color) {
    const { r, g, b } = hexToRgb(style.background.color);
    device.fillImage(index, r, g, b);
  } else {
    device.clearKey(index);
  }
};

const buttonDownHandler = (index) => {
  console.log("Button pressed", index);
};

const loadDeviceConfig = async (device, config) => {
  const buttons = config?.buttons || [];
  const brightness = config?.brightness || 70;

  device.clearAllKeys();
  device.setBrightness(brightness);

  if (!buttonHandlerAttached) {
    device.on("up", buttonDownHandler);
    buttonHandlerAttached = true;
  }

  // Clear gif timeouts //
  Object.keys(drawingIndexes).forEach(index => clearInterval(drawingIndexes[index]));

  for (const button of buttons) {
    const { index } = button || {};

    if (isNil(index)) {
      console.log("Config is invalid");
      continue;
    }

    setButtonBackground(device, button);
  }
};

export default loadDeviceConfig;
