"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DigitsValidator {
    isValidUserInput(numStr) {
        try {
            if (!numStr) {
                return false;
            }
            if (!this.strOnlyContainsDigitsOrCommas(numStr)) {
                return false;
            }
        }
        catch (err) {
            throw err;
        }
        return true;
    }
    strOnlyContainsDigitsOrCommas(numStr) {
        try {
            return /^(\d|,)+$/.test(numStr);
        }
        catch (err) {
            throw err;
        }
    }
}
class BinaryConverter {
    constructor() {
        this.validator = new DigitsValidator();
    }
    getBitsFromDecimalNumber(decimalNum) {
        let bits;
        try {
            if (!this.validator.isValidUserInput(decimalNum)) {
                throw new Error("Please input a valid decimal number for conversion to binary");
            }
            const decimal = this.prepareNumber(decimalNum);
            bits = this.accumulateBits(decimal, []);
        }
        catch (err) {
            throw err;
        }
        return bits;
    }
    prepareNumber(decimalNum) {
        let decimal;
        try {
            const asStr = decimalNum.replace(/,/g, "").trim();
            decimal = Number(asStr);
        }
        catch (err) {
            throw err;
        }
        return decimal;
    }
    accumulateBits(decimalNum, acc) {
        try {
            if (decimalNum === 0) {
                return this.make15BitsLong(acc).join("");
            }
            const quotient = Math.floor(decimalNum / 2);
            if (decimalNum % 2 === 1) {
                return this.accumulateBits(quotient, ["1", ...acc]);
            }
            return this.accumulateBits(quotient, ["0", ...acc]);
        }
        catch (err) {
            throw err;
        }
    }
    make15BitsLong(bits) {
        const extraBits = [];
        const len = bits.length;
        const diff = 15 - len;
        for (let i = 0; i < diff; i++) {
            extraBits.push("0");
        }
        return [...extraBits, ...bits];
    }
}
exports.default = BinaryConverter;
//# sourceMappingURL=BinaryConverter.js.map