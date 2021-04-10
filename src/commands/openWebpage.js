import React from "react";
import { shell } from "electron";

const { exec } = require("child_process");

export function getOptionsComponent(payload, onUpdatePayload) {
  const handleUpdate = (event) => {
    const urlValue = event?.target?.value;

    onUpdatePayload({
      url: urlValue,
    });
  };

  const { url } = payload || {};

  return (
    <div className="pt-2">
      <label htmlFor="webpageUrl" className="form-label">Web Page</label>
      <input type="url" className="form-control" id="webpageUrl" value={url || ""} onChange={handleUpdate} />
    </div>
  );
}

export async function runCommand(payload) {
  const { url } = payload;

  if (!url) return;

  await shell.openExternal(url);
}
