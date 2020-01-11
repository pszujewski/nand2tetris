import JackTokenizer from "../JackTokenizer";
export default class CompilationEngine {
    private tokenizer;
    private vmSegment;
    private identifierTable;
    private vmWriter;
    constructor(tokenizer: JackTokenizer, writeToPath: string);
    compile(): Promise<void>;
    compileClass(): void;
    private compileClassVarDec;
    private compileSubroutine;
    private compileParameterList;
    private compileSubroutineBody;
    private compileVarDec;
    private compileStatements;
    private compileDo;
    private compileLet;
    private compileWhile;
    private compileReturn;
    private compileIf;
    private compileExpression;
    private compileTerm;
    private compileTermKeyword;
    private compileSubroutineCall;
    private compileExpressionList;
}
//# sourceMappingURL=index.d.ts.map