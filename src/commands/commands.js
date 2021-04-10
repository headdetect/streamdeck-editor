/* eslint-disable global-require */
// eslint-disable-next-line import/prefer-default-export
export const commands = {
  "Execute": require("./execute"),
  "HTTP Request": require("./makeHttpRequest"),
  "Script": require("./script"),
  "Open Webpage": require("./openWebpage"),
  "Send Keys": require("./sendKeys"),
};
