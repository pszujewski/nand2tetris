import Segment from "../../types/Segment";
import VMSegment from "./VMSegment";
import VMCommand from "../../types/VMCommand";
import * as fs from "fs";
import * as fspath from "path";

export default class VMWriter {
    private output: string;
    private writeToPath: string;
    private vmSegment: VMSegment;

    constructor(writeToPath: string) {
        this.output = "";
        this.writeToPath = writeToPath;
        this.vmSegment = new VMSegment();
    }

    /**
     *
     * @param seg
     * @param segmentIdx
     * Writes a VM Push command. Pushes to the top of Stack from a
     * virtual memory segment (push the value of segment[idx] onto the stack)
     */
    public writePush(seg: Segment, segmentIdx: number) {
        const segment: string = this.vmSegment.get(seg);
        this.addToOutput(`push ${segment} ${segmentIdx}`);
    }

    /**
     *
     * @param seg
     * @param segmentIdx
     * Writes a VM Pop command. Pops from the top of the Stack to
     * a virtual memory segment (pop the top of the stack and store it in segment[idx])
     */
    public writePop(seg: Segment, segmentIdx: number) {
        const segment: string = this.vmSegment.get(seg);
        this.addToOutput(`pop ${segment} ${segmentIdx}`);
    }

    /**
     *
     * @param command
     * Writes a VM Arithmetic command
     */
    public writeArithmetic(command: VMCommand) {
        if (this.isValidArithmetic(command)) {
            this.addToOutput(command);
        } else {
            throw new Error("Invalid VM command provided" + command);
        }
    }

    /**
     *
     * @param label
     * Writes a VM label command
     */
    public writeLabel(label: string) {
        this.addToOutput(`label ${label}`);
    }

    /**
     *
     * @param label
     * Writes a VM goto command
     */
    public writeGoto(label: string) {
        this.addToOutput(`goto ${label}`);
    }

    /**
     *
     * @param label
     * Writes a VM if-goto command
     */
    public writeIf(label: string) {
        this.addToOutput(`if-goto ${label}`);
    }

    /**
     *
     * @param functionName
     * @param nArgs
     * Writes a VM call command
     */
    public writeCall(functionName: string, nArgs: number) {
        this.addToOutput(`call ${functionName} ${nArgs}`);
    }

    /**
     *
     * @param functionName
     * @param nLocals
     * Writes a VM function command, noting number of local variables
     */
    public writeFunction(functionName: string, nLocals: number) {
        this.addToOutput(`function ${functionName} ${nLocals}`);
    }

    /**
     * Writes a VM return command
     */
    public writeReturn() {
        this.addToOutput("return");
    }

    /**
     * Closes the output file and write the output
     */
    public close(): Promise<void> {
        return this.writeVmOutputToFile();
    }

    private addToOutput(toAdd: string) {
        this.output.concat(`${toAdd}\r\n`);
    }

    private isValidArithmetic(command: VMCommand): boolean {
        const validCommands: VMCommand[] = [
            VMCommand.Add,
            VMCommand.And,
            VMCommand.Eq,
            VMCommand.Gt,
            VMCommand.Lt,
            VMCommand.Neg,
            VMCommand.Not,
            VMCommand.Or,
            VMCommand.Sub,
        ];
        return validCommands.includes(command);
    }

    private writeVmOutputToFile(): Promise<void> {
        const name = `./out/${this.writeToPath}.vm`;
        const path: string = fspath.resolve(__dirname, name);

        return new Promise<void>(resolve => {
            fs.writeFile(path, this.output, err => {
                if (err) {
                    console.error("Unable to write output to file");
                }
                resolve();
            });
        });
    }
}
