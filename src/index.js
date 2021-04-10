import React from "react";
import { render } from "react-dom";
import * as MenuBuilder from "./menu";
import { mainWindow } from "electron";

import { Provider } from "react-redux";
import store from "./store/store";

import App from "./App";
import "./assets/scss/App.scss";

const appRoot = document.createElement("div");
appRoot.id = "root";

document.getElementsByTagName("body")[0].appendChild(appRoot);

render(
  <Provider store={store}>
    <App />
  </Provider>,
  appRoot,
);
