import { execFile } from "child_process";

import Jimp from "jimp";
import fs from "fs";

const gifsicle = require("gifsicle");

export const gifRegex = /^GIF8[79]a/;

export const transparentImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
// 480x270

// w/2 - h/2 = 105 (x1)

// 240 - 135 = 105
// 240 + 135 = 375

export const saveRaw = async (input, output, background, size) => {
  const inputBuffer = fs.readFileSync(input);

  if (input.endsWith(".gif")) {
    if (gifRegex.test(inputBuffer.toString("ascii", 0, 6))) {
      const width = inputBuffer.readUInt16LE(6);
      const height = inputBuffer.readUInt16LE(8);

      let crop;

      if (width < height) {
        const y1 = (height - width) / 2;
        const y2 = (height + width) / 2;

        crop = `${0},${y1}-${width},${y2}`;
      } else if (width > height) {
        const x1 = (width - height) / 2;
        const x2 = (width + height) / 2;

        crop = `${x1},${0}-${x2},${height}`;
      } else {
        crop = `0,0-${width},${height}`;
      }

      execFile(gifsicle, ["-o", output, "--crop", crop, "--resize", `${size}x${size}`, input], error => {
        throw error;
      });
    } else {
      // TODO: notification
      console.log("This type of gif is not supported");
    }
  } else {
    // Copy uploaded to data file so we can present in the UI //
    fs.copyFileSync(input, output);

    const raw = await Jimp.read(inputBuffer);

    raw.cover(size, size);

    const compositeImage = await new Promise((res, rej) => {
      new Jimp(size, size, background || "#000000", (err, jimpImage) => {
        if (err) {
          rej(err);
          return;
        }

        res(jimpImage);
      });
    });

    compositeImage
      .quality(100)
      .composite(raw, 0, 0);

    const compositeBuffer = compositeImage.bitmap.data;

    fs.writeFileSync(output, compositeBuffer);
  }
};
