import fs from "fs";
import fspath from "path";

export default class JackFileReader {
    private relativePathToDir: string;
    private directoryName: string;

    constructor(relPath: string) {
        this.relativePathToDir = `../${relPath}`;
        this.directoryName = this.identifyJackDirectory();
    }

    public async read(): Promise<string[]> {
        let pathsToJackFiles: string[];
        let jackCode: string;
        let codeTokens: string[];

        try {
            pathsToJackFiles = await this.getAbsolutePathsToJackFiles();
            jackCode = await this.readDataInJackFiles(pathsToJackFiles);
            codeTokens = this.tokenizeJackCode(jackCode);
        } catch (err) {
            throw new Error(err.message);
        }
        return codeTokens;
    }

    public getDirectoryName(): string {
        return this.directoryName;
    }

    private identifyJackDirectory(): string {
        const pathTokens: string[] = this.tokenizePath();
        return pathTokens[pathTokens.length - 1].trim();
    }

    private tokenizePath(): string[] {
        return this.relativePathToDir.split("/");
    }

    private async readDataInJackFiles(paths: string[]): Promise<string> {
        let fileReads: Promise<string>[];
        let tokenStream: string;

        try {
            fileReads = paths.map(path => this.readOneJackFile(path));
            const data: string[] = await Promise.all(fileReads);
            tokenStream = data.join("");
        } catch (err) {
            throw err;
        }
        return new Promise(resolve => resolve(tokenStream));
    }

    private readOneJackFile(fullPath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(fullPath, (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data.toString());
            });
        });
    }

    private tokenizeJackCode(sourceJackCode: string): string[] {
        let tokens: string[];

        tokens = sourceJackCode.replace(/\r/g, "").split("\n");
        tokens = tokens.filter(t => t && t.length > 0 && t.indexOf("//") !== 0);

        return tokens.map(t => {
            if (t.indexOf("//")) {
                return t.replace(/\/\/.+/g, "").trim();
            }
            return t;
        });
    }

    private getAbsolutePathsToJackFiles(): Promise<string[]> {
        const p: string = this.relativePathToDir;
        const pathToDirectory: string = fspath.join(__dirname, p);

        return new Promise((resolve, reject) => {
            fs.readdir(pathToDirectory, (err, fileNames) => {
                if (err) {
                    reject("Unable to read");
                }
                resolve(this.parseAbsolutePaths(fileNames));
            });
        });
    }

    private parseAbsolutePaths(fileNames: string[]): string[] {
        let names: string[];

        names = this.keepOnlyJack(fileNames.map(f => f.trim()));
        names = this.convertToAbsolutePaths(names);

        return names.sort((a: string): number => {
            if (a.indexOf("Main.jack") > -1) {
                return -1;
            }
            return 0;
        });
    }

    private keepOnlyJack(fileNames: string[]): string[] {
        return fileNames.filter(f => f.indexOf(".jack") > -1);
    }

    private convertToAbsolutePaths(fileNames: string[]): string[] {
        return fileNames.map((f: string) => {
            const pathTokens: string[] = this.tokenizePath();
            pathTokens.push(f);
            return fspath.join(__dirname, pathTokens.join("/"));
        });
    }
}
