"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var JackAnalyzer_1 = __importDefault(require("./JackAnalyzer"));
var Main = (function () {
    function Main() {
    }
    Main.run = function () {
        var path = process.argv[2];
        var JA = new JackAnalyzer_1.default(path);
        JA.analyze();
    };
    return Main;
}());
Main.run();
//# sourceMappingURL=index.js.map