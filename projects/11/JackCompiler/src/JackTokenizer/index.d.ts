import CurrentToken from "../../types/CurrentToken";
import TokenType from "../../types/TokenType";
export default class JackTokenizer {
    private syntacticElements;
    private pointer;
    private currentToken;
    private lookAheadToken;
    constructor(syntacticElements: string[]);
    isFirstTokenClassKeyword(): boolean;
    hasMoreTokens(): boolean;
    advance(): void;
    private advanceLookAhead;
    lookAhead(): string;
    getTokenType(): TokenType;
    getCurrentToken(): string;
    getPointer(): number;
    getCurrentTokenState(): CurrentToken;
    getTokenAtPointer(pointerValue: number): string;
    isValidPointerValue(value: number): boolean;
    getKeyword(): string;
    getSymbol(): string;
    getIdentifier(): string;
    getIntVal(): number;
    getStringVal(): string;
}
//# sourceMappingURL=index.d.ts.map