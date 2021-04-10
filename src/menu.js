const { app, Menu, shell } = require("electron");

let mainWindow;

const isRunningAtStartup = () => {
  switch (process.platform) {
    case "linux":

  }
}

const startOnBoot = () => {

}

const subMenuConfigTools = {
  label: "Tools",
  submenu: [
    {
      label: "Import Config",
    },
    {
      label: "Export Config",
    },
    { type: "separator" },
    {
      label: "Run on startup",
      click: startOnBoot,
    }
  ]
};


const subMenuDevTools = {
  label: "Dev Tools",
  submenu: [
    {
      label: "Reload",
      accelerator: process.platform === "darwin" ? "Command+R" : "Ctrl+R",
      click: () => {
        mainWindow.webContents.reload();
      },
    },
    {
      label: "Toggle Developer Tools",
      accelerator: process.platform === "darwin" ? "Alt+Command+I" : "Ctrl+Shift+I",
      click: () => {
        mainWindow.webContents.toggleDevTools();
      },
    },
  ],
};

const subMenuHelp = {
  label: "Help",
  submenu: [
    {
      label: "Learn More",
      click() {
        shell.openExternal("https://github.com/headdetect/streamdeck-editor");
      },
    },
    {
      label: "Documentation",
      click() {
        shell.openExternal("https://github.com/headdetect/streamdeck-editor/blob/master/README.md")
      },
    },
    {
      label: "Search Issues",
      click() {
        shell.openExternal("https://github.com/headdetect/streamdeck-editor/issues");
      },
    },
  ],
};

const buildMenu = (window) => {
  mainWindow = window;

  if (
    process.env.NODE_ENV === "development"
    || process.env.DEBUG_PROD === "true"
  ) {
    setupDevelopmentEnvironment();
  }

  const template = process.platform === "darwin"
    ? buildDarwinTemplate()
    : buildDefaultTemplate();

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  return menu;
};

const setupDevelopmentEnvironment = () => {
  mainWindow.webContents.on("context-menu", (_, props) => {
    const { x, y } = props;

    Menu.buildFromTemplate([
      {
        label: "Inspect element",
        click: () => {
          mainWindow.webContents.inspectElement(x, y);
        },
      },
    ]).popup({ window: mainWindow });
  });
};

const buildDarwinTemplate = () => {
  const subMenuAbout = {
    label: "StreamDeck Editor",
    submenu: [
      {
        label: "About ElectronReact",
        selector: "orderFrontStandardAboutPanel:",
      },
      { type: "separator" },
      { label: "Services", submenu: [] },
      { type: "separator" },
      {
        label: "Hide StreamDeck Editor",
        accelerator: "Command+H",
        selector: "hide:",
      },
      {
        label: "Hide Others",
        accelerator: "Command+Shift+H",
        selector: "hideOtherApplications:",
      },
      { label: "Show All", selector: "unhideAllApplications:" },
      { type: "separator" },
      {
        label: "Quit",
        accelerator: "Command+Q",
        click: () => {
          app.quit();
        },
      },
    ],
  };

  const subMenuView = process.env.NODE_ENV === "development"
    || process.env.DEBUG_PROD === "true"
    ? [subMenuDevTools]
    : [];

  return [subMenuAbout, subMenuConfigTools, subMenuHelp, ...[subMenuView]];
};

const buildDefaultTemplate = () => {
  const menu = [subMenuConfigTools, subMenuHelp];

  if (process.env.NODE_ENV === "development"
  || process.env.DEBUG_PROD === "true") {
    menu.push(subMenuDevTools)
  }

  return menu;
};

module.exports = {
  buildMenu
};
