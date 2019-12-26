import Segment from "../../types/Segment";
import { VariableKind } from "../../types/Scope";

export default class VMSegment {
    get(seg: Segment): string {
        switch (seg) {
            case Segment.CONST:
                return "constant";
            case Segment.ARG:
                return "argument";
            case Segment.LOCAL:
                return "local";
            case Segment.POINTER:
                return "pointer";
            case Segment.STATIC:
                return "static";
            case Segment.TEMP:
                return "temp";
            case Segment.THAT:
                return "that";
            case Segment.THIS:
                return "this";
            default:
                throw new Error("Invalid Segment");
        }
    }

    getFromKind(kind: VariableKind): Segment {
        switch (kind) {
            case VariableKind.ARG:
                return Segment.ARG;
            case VariableKind.FIELD:
                return Segment.THIS;
            case VariableKind.STATIC:
                return Segment.STATIC;
            case VariableKind.VAR:
                return Segment.LOCAL;
            default:
                throw new Error("Invalid Segment");
        }
    }
}
