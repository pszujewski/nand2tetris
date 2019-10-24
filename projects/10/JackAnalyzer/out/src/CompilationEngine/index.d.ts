import JackTokenizer from "../JackTokenizer";
export default class CompilationEngine {
    private tokenizer;
    private xmlWriter;
    constructor(tokenizer: JackTokenizer, writeToPath: string);
    compile(): void;
    compileClass(xmlRoot?: string): string;
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
    private compileConditional;
    private compileExpression;
    private compileTerm;
    private compileSubroutineCall;
    private compileExpressionList;
}
//# sourceMappingURL=index.d.ts.map