import React from "react";
import { render } from "react-dom";
import App from "./App";
import "./assets/scss/App.scss";

const appRoot = document.createElement("div");
appRoot.id = "root";

document.getElementsByTagName("body")[0].appendChild(appRoot);

render(<App />, appRoot);
