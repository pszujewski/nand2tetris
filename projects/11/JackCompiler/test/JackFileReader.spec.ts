//import { expect } from "chai";
//import JackFileReader from "../src/JackTokenizer/JackFileReader";
import JackAnalyzer from "../src/JackAnalyzer";

describe("JackFileReader", () => {
    //let reader: JackFileReader;

    // it("Should parse Jack Files into input tokens array", async () => {
    //     let result: string[];

    //     try {
    //         reader = new JackFileReader("../../ArrayTest");
    //         result = await reader.g
    //     } catch (err) {
    //         console.log(err.message);
    //         result = err;
    //     }

    //     expect(result).to.deep.equal([]);
    // });

    it("Should compile Jack Filesinto XML", async () => {
        let JA: JackAnalyzer;

        try {
            JA = new JackAnalyzer("../../../Square");
            await JA.analyze();
        } catch (err) {
            console.log(err.message);
        }
    });
});
