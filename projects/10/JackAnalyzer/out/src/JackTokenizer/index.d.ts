import CurrentToken from "../../types/CurrentToken";
import TokenType from "../../types/TokenType";
export default class JackTokenizer {
    private syntacticElements;
    private pointer;
    private currentToken;
    constructor(syntacticElements: string[]);
    isFirstTokenClassKeyword(): boolean;
    hasMoreTokens(): boolean;
    advance(): void;
    lookAhead(): string;
    getTokenType(): TokenType;
    getCurrentToken(): string;
    getCurrentTokenState(): CurrentToken;
    getKeyword(): string;
    getSymbol(): string;
    getIdentifier(): string;
    getIntVal(): number;
    getStringVal(): string;
}
//# sourceMappingURL=index.d.ts.map