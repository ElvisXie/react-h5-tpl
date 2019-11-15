const path = require("path");

module.exports = {
  SOURCE_DIR: path.resolve(__dirname, "../src"),
  OUTPUT_DIR: path.resolve(__dirname, "../dist"),
  NODE_MODULES_DIR: path.resolve(__dirname, "../node_modules"),
  FAVICON_ICO_PATH: path.resolve(__dirname, "../public/favicon.ico"),
  HTML_TEMPLATE_PATH: path.resolve(__dirname, "../public/index.ejs"),
  PUBLIC_PATH: process.env.PUBLIC_PATH || "/"
};
