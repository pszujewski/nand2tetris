import Segment from "../../types/Segment";
import { VariableKind } from "../../types/Scope";
export default class VMSegment {
    get(seg: Segment): string;
    getFromKind(kind: VariableKind): Segment;
}
//# sourceMappingURL=VMSegment.d.ts.map