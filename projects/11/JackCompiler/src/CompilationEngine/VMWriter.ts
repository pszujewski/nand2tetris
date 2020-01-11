import Segment from "../../types/Segment";
import VMSegment from "./VMSegment";
import VMCommand from "../../types/VMCommand";
import * as fs from "fs";
import * as fspath from "path";

export default class VMWriter {
    private output: string;
    private writeToPath: string;
    private vmSegment: VMSegment;
    private labelIndex: number;

    constructor(writeToPath: string) {
        this.output = "";
        this.labelIndex = 0;
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

    public getLabelIndex(): number {
        const labelIdx: number = this.labelIndex;
        this.labelIndex = this.labelIndex + 1;
        return labelIdx;
    }

    /**
     *
     * @param label
     * Writes a VM label command
     */
    public writeLabel(label: string, labelIdx: number): void {
        const labelName = `${label}_${labelIdx.toString()}`;
        this.addToOutput(`label ${labelName}`);
    }

    /**
     *
     * @param label
     * Writes a VM goto command
     */
    public writeGoto(label: string, labelIdx: number) {
        this.addToOutput(`goto ${label}_${labelIdx.toString()}`);
    }

    /**
     *
     * @param label
     * Writes a VM if-goto command
     */
    public writeIf(label: string, labelIdx: number) {
        this.addToOutput(`if-goto ${label}_${labelIdx.toString()}`);
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
    public writeFunction(functionName: string) {
        this.addToOutput(`function ${functionName} {nLocals}`);
    }

    public writeLocalsCountToFunctionDefinition(nLocals: number) {
        this.output = this.output.replace(/{nLocals}/, nLocals.toString());
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
        this.output = this.output.concat(`${toAdd}\r\n`);
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
