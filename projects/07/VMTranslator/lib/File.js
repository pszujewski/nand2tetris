"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports["default"] = void 0;var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));var fs = require("fs");
var fspath = require("path");var

File = /*#__PURE__*/function () {function File() {(0, _classCallCheck2["default"])(this, File);}(0, _createClass2["default"])(File, null, [{ key: "read", value: function read(
    relPath) {
      var path = fspath.join(__dirname, relPath);

      return new Promise(function (resolve, reject) {
        fs.readFile(path, function (err, data) {
          if (err) {
            reject(err);
          }
          resolve(data.toString());
        });
      });
    } }, { key: "write", value: function write(

    fileName, tokens) {
      var path = fspath.resolve(__dirname, "./".concat(fileName));

      var content = JSON.stringify(tokens, null, 4);

      return new Promise(function (resolve) {
        fs.writeFile(path, content, function (err) {
          if (err) {
            console.error("Unable to write data");
          }
          resolve();
        });
      });
    } }]);return File;}();exports["default"] = File;
//# sourceMappingURL=File.js.map