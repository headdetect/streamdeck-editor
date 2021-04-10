import React from "react";

const { promisify } = require('util');
const exec = promisify(require('child_process').exec)
const sudoExec = promisify(require('sudo-prompt').exec)

export function getOptionsComponent(payload, onUpdatePayload) {
  const handleUpdateCommand = (event) => {
    const commandValue = event?.target?.value;

    onUpdatePayload({
      ...payload,
      command: commandValue,
    });
  };

  const handleUpdateSudo = (event) => {
    const sudo = event?.target?.checked;

    onUpdatePayload({
      ...payload,
      sudo,
    });
  };

  const { command, sudo = false } = payload || {};

  return (
    <div className="pt-2">
      <label htmlFor="executeCommand" className="form-label">Command</label>
      <textarea className="form-control" id="executeCommand" value={command || ""} onChange={handleUpdateCommand} />
      { sudo && <p><small>You don't need to add sudo if "run as sudo" is enabled</small></p> }

      <div className="form-check pt-1">
        <input className="form-check-input" type="checkbox" checked={Boolean(sudo)} id="sudoBox" onChange={handleUpdateSudo} />
        <label className="form-check-label" htmlFor="sudoBox">
          Run as sudo/admin?
        </label>
      </div>
    </div>
  );
}

export async function runCommand(payload) {
  const { command, sudo: requiresSudo = false } = payload;

  if (!command) return;

  const response = requiresSudo
    ? await sudoExec(command, { name: "StreamDeck" })
    : await exec(command);

  console.log(response);
}
