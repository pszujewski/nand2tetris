import JackTokenizer from "../JackTokenizer";
import KeywordTable from "../KeywordTable";
import Symbol from "../../types/Symbol";
import SymbolTable from "../SymbolTable";
import XMLWriter from "./XMLWriter";
import CurrentToken from "../../types/CurrentToken";
import Keyword from "../../types/Keyword";

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
    public compileClass(xmlRoot = ""): string {
        let xml: string = xmlRoot;
        this.tokenizer.advance();

        const tokenState: CurrentToken = this.tokenizer.getCurrentTokenState();

        // base case
        if (tokenState.isSymbol && tokenState.value === Symbol.CurlyLeft) {
            return xml.concat(this.xmlWriter.getSymbol());
        }

        if (KeywordTable.isClass(tokenState.value)) {
            return this.compileClass(xml.concat(this.xmlWriter.getKeyword()));
        }

        if (tokenState.isIdentifier) {
            return this.compileClass(
                xml.concat(this.xmlWriter.getIdentifier())
            );
        }

        if (tokenState.isSymbol && tokenState.value === Symbol.CurlyRight) {
            return this.compileClass(xml.concat(this.xmlWriter.getSymbol()));
        }

        if (KeywordTable.isClassVarDec(tokenState.value)) {
            return this.compileClass(
                this.compileClassVarDec(xml.concat(this.xmlWriter.getKeyword()))
            );
        }

        if (KeywordTable.isSubroutineDec(tokenState.value)) {
            return this.compileClass(
                this.compileSubroutine(
                    xml.concat(`<subroutineDec>${this.xmlWriter.getKeyword()}`)
                )
            );
        }

        throw new Error("Failed to compile class");
    }

    /** Compiles a static declaration or a field declaration.
     * (static | field) type varName (, varName)*
     * */
    private compileClassVarDec(xml: string): string {
        this.tokenizer.advance();
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

    private compileSubroutine(xml: string): string {
        // return type
        this.tokenizer.advance();
        xml = xml.concat(this.xmlWriter.getIdentifier());

        // function | method | constructor name
        this.tokenizer.advance();
        xml = xml.concat(this.xmlWriter.getIdentifier());

        // open paran
        this.tokenizer.advance();
        xml = xml.concat(this.xmlWriter.getSymbol());

        xml = this.compileParameterList(xml.concat("<parameterList>"));
        return this.compileSubroutineBody(xml.concat("<subroutineBody>"));
    }

    /** Compile a possibly empty parameter list */
    private compileParameterList(xml: string): string {
        this.tokenizer.advance();
        const tokenState: CurrentToken = this.tokenizer.getCurrentTokenState();

        // base case
        if (tokenState.isSymbol && tokenState.value === Symbol.ParenLeft) {
            return `</parameterList>${xml.concat(this.xmlWriter.getSymbol())}`;
        }

        if (tokenState.isKeyword) {
            return this.compileParameterList(
                xml.concat(this.xmlWriter.getKeyword())
            );
        }

        if (tokenState.isIdentifier) {
            return this.compileParameterList(
                xml.concat(this.xmlWriter.getIdentifier())
            );
        }

        if (tokenState.isSymbol && tokenState.value === Symbol.Comma) {
            return this.compileParameterList(
                xml.concat(this.xmlWriter.getSymbol())
            );
        }

        throw new Error("Failed to compile parameter list");
    }

    private compileSubroutineBody(xml: string): string {
        this.tokenizer.advance();
        const tokenState: CurrentToken = this.tokenizer.getCurrentTokenState();

        // base case
        if (tokenState.isSymbol && tokenState.value === Symbol.CurlyLeft) {
            return `${xml.concat(this.xmlWriter.getSymbol())}</subroutineBody>`;
        }

        // Start of subroutine body
        if (tokenState.isSymbol && tokenState.value === Symbol.CurlyRight) {
            return this.compileSubroutineBody(this.xmlWriter.getSymbol());
        }

        if (tokenState.isKeyword && tokenState.value === Keyword.Var) {
            return this.compileSubroutineBody(
                this.compileVarDec(xml.concat(this.xmlWriter.getKeyword()))
            );
        }

        return this.compileSubroutineBody(this.compileStatements(xml));
    }

    /** Compiles a var declaration */
    private compileVarDec(xml: string): string {}

    /** Compiles a sequence of statements not including the enclosing brackets */
    private compileStatements(xml: string): string {}
}
