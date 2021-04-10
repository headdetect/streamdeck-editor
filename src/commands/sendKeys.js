import React, { useState } from "react";

import * as robot from "robotjs";

const parseKeys = (keys) => {
  // Parse out special keys //

  // TODO: make this actually parse out keys
  return [...(keys || [])];
}

export function getOptionsComponent(payload, onUpdatePayload) {
  const handleUpdateKeys = (event) => {
    const keys = event?.target?.value;

    onUpdatePayload({
      keys,
    });
  };

  const { keys } = payload || {};

  const parsedKeys = parseKeys(keys);

  return (
    <>
      <div className="pt-2">
        Append modifier keystrokes with <code>$</code>. For example:

        <ul>
          <li>Sending an enter key becomes <code>$enter</code></li>
          <li>Sending a ctrl key becomes <code>$ctrl</code></li>
          <li>Send combo key strokes by using <code>+</code></li>
          <li>To send something like ctrl+alt+t do <code>$ctrl+$alt+t</code></li>
        </ul>
      </div>
      <div className="pt-2">
        <label htmlFor="keyStrokes" className="form-label">Keys</label>
        <textarea className="form-control" id="keyStrokes" value={keys || ""} onChange={handleUpdateKeys} />
      </div>
      <div className="pt-2">
        Current sequence:
        {
          parsedKeys.map((key, index) => <code key={index}> {key}</code>)
        }
      </div>
    </>
  );
}

export async function runCommand(payload) {
  const { keys } = payload;

  const parsedKeys = parseKeys(keys);

  for (const key of parsedKeys) {
    robot.keyTap(key)
  }
}
