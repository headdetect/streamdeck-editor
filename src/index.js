import React from "react";
import { render } from "react-dom";
import App from "./App";
import "./App.global.css";

const appRoot = document.createElement("div");
appRoot.id = "root";

document.getElementsByTagName("body")[0].appendChild(appRoot);

render(<App />, appRoot);
