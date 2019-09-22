import JackTokenizer from "../JackTokenizer";

/**
 * Effects the actual complation output. Gets its input from a JackTokenizer and emits its parsed
 * structure into an output stream. Every syntactic element of the Jack language has a cooresponding
 * 'compile routine.'
 *
 * The contract between these routines is that each 'compile routine' should read the syntactic
 * construct 'abc' from the input, advance() thetokenizer exactly beyond 'abc', and output the
 * parsing of 'abc'.
 *
 * The first routine called must be 'compileClass'
 */

export default class CompilationEngine {
    private jackTokenizer: JackTokenizer;

    constructor(tokenizer: JackTokenizer) {
        this.jackTokenizer = tokenizer;
    }

    /** Compiles a complete class */
    public compileClass(): void {}

    /** Compiles a static declaration or a field declaration */
    private compileClassVarDec(): void {}
}
