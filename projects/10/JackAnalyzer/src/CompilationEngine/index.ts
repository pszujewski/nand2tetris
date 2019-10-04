import JackTokenizer from "../JackTokenizer";
import KeywordTable from "../KeywordTable";
import TokenType from "../../types/TokenType";
import Symbol from "../../types/Symbol";
import SymbolTable from "../SymbolTable";
import XMLWriter from "./XMLWriter";
import CurrentToken from "../../types/CurrentToken";

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
    private tokenizer: JackTokenizer;
    private xmlWriter: XMLWriter;

    constructor(tokenizer: JackTokenizer) {
        this.tokenizer = tokenizer;
        this.xmlWriter = new XMLWriter(tokenizer);
    }

    public compile(): void {
        let xml: string;

        try {
            if (this.tokenizer.isFirstTokenClassKeyword()) {
                xml = this.compileClass();
                console.log("Write XML", xml);
            } else {
                throw new Error("Program must begin with a class declaration");
            }
        } catch (error) {
            throw error;
        }
    }

    /** Compiles a complete class */
    public compileClass(xml = ""): string {
        this.tokenizer.advance();

        const tokenState: CurrentToken = this.tokenizer.getCurrentTokenState();

        if (tokenState.isSymbol && tokenState.value === Symbol.CurlyLeft) {
            return xml.concat(this.xmlWriter.getSymbol());
        }

        if (KeywordTable.isClassVarDec(tokenState.value)) {
            return this.compileClassVarDec(xml);
        }

        return this.compileClass(xml);
    }

    /** Compiles a static declaration or a field declaration.
     * (static | field) type varName (, varName)*
     * */
    private compileClassVarDec(xml: string): string {
        const tokenState: CurrentToken = this.tokenizer.getCurrentTokenState();

        if (SymbolTable.isSemi(tokenState.value)) {
            return xml.concat(this.xmlWriter.getSymbol());
        }

        if (tokenState.isKeyword) {
            return this.compileClassVarDec(
                xml.concat(this.xmlWriter.getKeyword())
            );
        }

        if (tokenState.isSymbol && tokenState.value === Symbol.Comma) {
            return this.compileClassVarDec(
                xml.concat(this.xmlWriter.getSymbol())
            );
        }

        return this.compileClassVarDec(
            xml.concat(this.xmlWriter.getIdentifier())
        );
    }

    private compileSubroutne(): string {}

    /** Compile a possibly empty parameter list */
    private compileParameterList(): string {}
}
