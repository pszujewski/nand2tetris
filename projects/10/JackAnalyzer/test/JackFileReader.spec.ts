import { expect } from "chai";
import JackFileReader from "../src/JackTokenizer/JackFileReader";

describe("JackFileReader", () => {
    let reader: JackFileReader;

    it("Should parse Jack Files into input tokens array", async () => {
        let result: string[];

        try {
            reader = new JackFileReader("../../ArrayTest");
            result = await reader.read();
        } catch (err) {
            console.log(err.message);
        }

        expect(result).to.deep.equal([]);
    });
});
