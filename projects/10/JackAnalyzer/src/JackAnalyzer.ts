import JackTokenizer from "./JackTokenizer";
import JackFileReader from "./JackTokenizer/JackFileReader";
import JackCompilationEngine from "./CompilationEngine";

export default class JackAnalyzer {
    private fileReader: JackFileReader;

    constructor(relPathToJackFilesDir: string) {
        this.fileReader = new JackFileReader(relPathToJackFilesDir);
    }

    public async analyze(): Promise<void> {
        let i: number;
        let pathToJackFile: string;
        let pathsToAllJackFiles: string[];

        try {
            pathsToAllJackFiles = await this.fileReader.getAbsolutePathsToJackFiles();

            if (pathsToAllJackFiles.length === 0) {
                throw new Error("No Jack files found in given directory");
            }

            for (i = 0; i < pathsToAllJackFiles.length; i++) {
                pathToJackFile = pathsToAllJackFiles[i];
                await this.analyzeJackFile(pathToJackFile);
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    private async analyzeJackFile(pathToJackFile: string): Promise<void> {
        let inputTokens: string[];
        let writeToPath: string;

        let tokenizer: JackTokenizer;
        let engine: JackCompilationEngine;

        try {
            const path = pathToJackFile;
            inputTokens = await this.fileReader.readTokensFromJackFile(path);

            writeToPath = this.getWriteToPath(pathToJackFile);
            tokenizer = new JackTokenizer(inputTokens);

            engine = new JackCompilationEngine(tokenizer, writeToPath);
            engine.compile();
        } catch (err) {
            console.error(err.message);
        }
    }

    private getWriteToPath(pathToJackFile: string): string {
        const dir = this.fileReader.getDirectoryName();
        const fileName = this.getCurrentJackFileName(pathToJackFile);
        return `${dir}${this.getSplitOn(pathToJackFile)}${fileName}`;
    }

    private getCurrentJackFileName(absolutePathToJackFile: string): string {
        const path: string = absolutePathToJackFile;
        const pathTokens: string[] = path.split(this.getSplitOn(path));
        return pathTokens[pathTokens.length - 1].replace(".jack", "").trim();
    }

    private getSplitOn(path: string): string {
        if (path.indexOf("/") > -1) {
            return "/";
        }
        return "\\";
    }
}
