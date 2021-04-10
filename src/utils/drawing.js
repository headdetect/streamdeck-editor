import { hexToHsluv } from "hsluv";

export default function drawConfig(canvasContext, buttonConfig) {
  const { style } = buttonConfig;
  const { width: canvasWidth, height: canvasHeight } = canvasContext.canvas;

  if (style) {
    // Draw color //
    const backgroundColor = style?.background?.color || "#000000";
    canvasContext.fillStyle = backgroundColor;
    canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw image //
    if (style.background?.image) {
      // const image = await loadImage(`./data/${style.background.image}`);
      //
      // canvasContext.drawImage(image, 0, 0, canvasWidth, canvasHeight);
    }

    // Draw text //
    if (style.text?.value) {
      const hsluv = hexToHsluv(backgroundColor); // Get luminance of the background //
      const fontSize = style.text.fontSize || 16;
      const properties = style.text.properties || "";
      canvasContext.fillStyle = hsluv[2] > 70 ? "black" : "white"; // On a scale from 0 - 100.0 //
      canvasContext.font = `${properties} ${fontSize}px sans-serif`;
      canvasContext.textAlign = "center";

      const textHeight = +fontSize + 4; // 4px for padding
      const lines = style.text.value.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        canvasContext.fillText(line, canvasWidth / 2, (canvasHeight / 2) + (textHeight * i));
      }
    }
  }
}
