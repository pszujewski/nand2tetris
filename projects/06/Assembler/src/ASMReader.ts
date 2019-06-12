import * as fs from "fs";

export default class ASMReader {
    public async getTokens(path: string): Promise<string[]> {
        // let tokens: string[];
        let source: Buffer;

        try {
            source = await this.readFileAsync(path);
        } catch (err) {
            throw err;
        }
        return [];
    }

    private readFileAsync(path: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject): void => {
            fs.readFile(path, (err, data): void => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }
}