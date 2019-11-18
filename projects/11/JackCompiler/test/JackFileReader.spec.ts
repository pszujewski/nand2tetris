import { expect } from "chai";
import JackFileReader from "../src/JackTokenizer/JackFileReader";
import JackAnalyzer from "../src/JackCompiler";

describe("JackFileReader", () => {
    let reader: JackFileReader;

    it("Should compile Jack Filesinto XML", async () => {
        let JA: JackAnalyzer;

        try {
            JA = new JackAnalyzer("../../../{directoryNameHere}");
            await JA.analyze();
        } catch (err) {
            console.log(err.message);
        }
    });
});
