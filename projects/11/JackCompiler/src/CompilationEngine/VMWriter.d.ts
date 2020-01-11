import Segment from "../../types/Segment";
import VMCommand from "../../types/VMCommand";
export default class VMWriter {
    private output;
    private writeToPath;
    private vmSegment;
    private labelIndex;
    constructor(writeToPath: string);
    writePush(seg: Segment, segmentIdx: number): void;
    writePop(seg: Segment, segmentIdx: number): void;
    writeArithmetic(command: VMCommand): void;
    getLabelIndex(): number;
    writeLabel(label: string, labelIdx: number): void;
    writeGoto(label: string, labelIdx: number): void;
    writeIf(label: string, labelIdx: number): void;
    writeCall(functionName: string, nArgs: number): void;
    writeFunction(functionName: string): void;
    writeLocalsCountToFunctionDefinition(nLocals: number): void;
    writeReturn(): void;
    close(): Promise<void>;
    private addToOutput;
    private isValidArithmetic;
    private writeVmOutputToFile;
}
//# sourceMappingURL=VMWriter.d.ts.map