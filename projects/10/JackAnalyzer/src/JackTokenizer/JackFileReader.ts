import fs from "fs";
import fspath, { join } from "path";

export default class JackFileReader {
    private relativePathToDir: string;
    private directoryName: string;

    constructor(relPath: string) {
        this.relativePathToDir = relPath;
        this.directoryName = this.identifyJackDirectory();
    }

    public async read(): Promise<string[]> {
        let pathsToJackFiles: string[];

        try {
            pathsToJackFiles = await this.getAbsolutePathsToJackFiles();
        } catch (err) {
            throw new Error(err.message);
        }
    }

    private identifyJackDirectory(): string {
        const pathTokens: string[] = this.tokenizePath();
        return pathTokens[pathTokens.length - 1].trim();
    }

    private tokenizePath(): string[] {
        return this.relativePathToDir.split("/");
    }

    private getAbsolutePathsToJackFiles(): Promise<string[]> {
        let pathToDirectory: string;
        pathToDirectory = fspath.join(__dirname, this.relativePathToDir);

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

        return names.sort((a: string, b: string): number => {
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
            pathTokens.pop();

            pathTokens.push(f);
            return fspath.join(__dirname, pathTokens.join("/"));
        });
    }
}
