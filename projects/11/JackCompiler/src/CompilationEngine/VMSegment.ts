import Segment from "../../types/Segment";

export default class VMSegment {
    get(seg: Segment) {
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
}
