import * as fs from "fs";
import * as fspath from "path";
import Log from "./Util";

export default class HackFile {
    private fileName: string;

    public constructor(fileName: string) {
        this.fileName = fileName;
    }

    public write(machineCodes: string[]): Promise<void> {
        const name: string = this.fileName.replace(".asm", ".hack");

        const path: string = fspath.resolve(__dirname, `../bin/${name}`);

        const content: string = this.getContent(machineCodes);

        return new Promise<void>(resolve => {
            fs.writeFile(path, content, err => {
                if (err) {
                    Log.error("Unable to write data to cache");
                }
                resolve();
            });
        });
    }

    private getContent(machineCodes: string[]): string {
        return machineCodes.map((c: string) => `${c}\n`).join("");
    }
}
