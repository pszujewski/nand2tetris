import * as fs from "fs";

export default class ASMReader {
    public async getTokens(path: string): Promise<string[]> {
        let tokens: string[];

        try {
            const source: Buffer = await this.readFileAsync(path);
            const rawFile: string = source.toString();

            tokens = rawFile.replace(/\r/g, "").split("\n");
            tokens = tokens
                .map(t => t.trim())
                .filter(t => t && t.length > 0 && t.indexOf("//") !== 0);
        } catch (err) {
            throw err;
        }
        return tokens;
    }

    private readFileAsync(path: string): Promise<Buffer> {
        return new Promise<Buffer>(
            (resolve, reject): void => {
                fs.readFile(
                    path,
                    (err, data): void => {
                        if (err) {
                            reject(err);
                        }
                        resolve(data);
                    }
                );
            }
        );
    }
}
