import JackTokenizer from "./JackTokenizer";
import JackFileReader from "./JackTokenizer/JackFileReader";
import JackCompilationEngine from "./CompilationEngine";

export default class JackAnalyzer {
    private fileReader: JackFileReader;

    constructor(relPathToJackFilesDir: string) {
        this.fileReader = new JackFileReader(relPathToJackFilesDir);
    }

    public async analyze(): Promise<void> {
        let inputTokens: string[];

        let tokenizer: JackTokenizer;
        let engine: JackCompilationEngine;

        try {
            inputTokens = await this.fileReader.read();
            tokenizer = new JackTokenizer(inputTokens);

            engine = new JackCompilationEngine(tokenizer);
            engine.compile();
        } catch (err) {
            console.error(err.message);
        }
    }
}
