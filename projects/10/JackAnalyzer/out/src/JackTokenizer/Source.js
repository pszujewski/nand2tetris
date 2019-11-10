"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Source = (function () {
    function Source(src) {
        this.src = src;
        this.idx = 0;
    }
    Source.prototype.getNextChar = function () {
        var current = this.idx;
        this.idx = this.idx + 1;
        if (current < this.src.length) {
            return this.src[current];
        }
        return "";
    };
    return Source;
}());
exports.default = Source;
//# sourceMappingURL=Source.js.map