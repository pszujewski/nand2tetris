import * as fs from "fs";

export default class ASMReader {
  public async getTokens(path: string): Promise<string[]> {
    //let tokens: string[];
    let source: Buffer;
    let rawFile: string;

    try {
      source = await this.readFileAsync(path);
      rawFile = source.toString();
    } catch (err) {
      throw err;
    }
    return [];
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
