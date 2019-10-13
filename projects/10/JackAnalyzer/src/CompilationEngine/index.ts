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
                xml = `<class>${this.compileClass()}</class>`;
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
        const xml: string = xmlRoot;

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
            let nextXml = xml.concat("<classVarDec>");
            nextXml = nextXml.concat(this.xmlWriter.getKeyword());
            return this.compileClass(this.compileClassVarDec(nextXml));
        }

        if (KeywordTable.isSubroutineDec(tokenState.value)) {
            return this.compileClass(this.compileSubroutine(xml));
        }

        throw new Error("Failed to compile class");
    }

    /** Compiles a static declaration or a field declaration.
     * (static | field) type varName (, varName)*
     * */
    private compileClassVarDec(xml: string): string {
        return this.compileVarDec(xml).concat("</classVarDec>");
    }

    // Not recursive. The currentToken should be the first keyword in the
    // function definition when this function is entered (function | method | constructor)
    private compileSubroutine(xml: string): string {
        xml = xml.concat("<subroutineDec>");

        // Get the <keyword> (function | method | constructor)
        xml = xml.concat(this.xmlWriter.getKeyword());
        this.tokenizer.advance();

        // Get the return type <keyword>
        xml = xml.concat(this.xmlWriter.getKeyword());
        this.tokenizer.advance();

        // Append the function | method | constructor name <identifier>
        xml = xml.concat(this.xmlWriter.getIdentifier());
        this.tokenizer.advance();

        // open paren for the parameter list -- because it shouldn't be within <parameterList>
        xml = xml.concat(this.xmlWriter.getSymbol());

        // the parens should not be included as children to <parameterList> tag
        xml = this.compileParameterList(xml.concat("<parameterList>"));
        xml = xml.concat("</parameterList>");

        // At this point, the currentToken should be ')'. Append it and advance the pointer
        xml = xml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();

        // The currentToken should now be '{' with param list finished
        // The enclosing 'Curly Braces' are included as the first and last children to <subroutineBody>
        xml = this.compileSubroutineBody(xml.concat("<subroutineBody>"));

        // Close out the tags
        return xml.concat("</subroutineBody>").concat("</subroutineDec>");
    }

    /** Compile a possibly empty parameter list */
    private compileParameterList(xml: string): string {
        this.tokenizer.advance();
        const tokenState: CurrentToken = this.tokenizer.getCurrentTokenState();

        // base case -- ensuring <parameterList> is closed before 'getting' the closing paren symbol
        if (tokenState.isSymbol && tokenState.value === Symbol.ParenLeft) {
            return xml;
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

        // base case - The Curly baces are included as the first and last children to <subroutineBody>
        if (tokenState.isSymbol && tokenState.value === Symbol.CurlyLeft) {
            return xml.concat(this.xmlWriter.getSymbol());
        }

        // Start of subroutine body (braces are included as children of <subroutineBody>)
        if (tokenState.isSymbol && tokenState.value === Symbol.CurlyRight) {
            return this.compileSubroutineBody(
                xml.concat(this.xmlWriter.getSymbol())
            );
        }

        // Compile any varDecs
        if (tokenState.isKeyword && tokenState.value === Keyword.Var) {
            const keywordXml = this.xmlWriter.getKeyword();
            const xmlToPass = xml.concat("<varDec>").concat(keywordXml);

            return this.compileSubroutineBody(
                this.compileVarDec(xmlToPass).concat("</varDec>")
            );
        }

        // Anything else should be a keyword indicating the start of a 'statement'
        const nextXml = xml.concat("<statements>");

        return this.compileSubroutineBody(
            this.compileStatements(nextXml).concat("</statements>")
        );
    }

    /** Compiles a var declaration */
    private compileVarDec(xml: string): string {
        this.tokenizer.advance();
        const tokenState: CurrentToken = this.tokenizer.getCurrentTokenState();

        // base case
        if (SymbolTable.isSemi(tokenState.value)) {
            return xml.concat(this.xmlWriter.getSymbol());
        }

        if (tokenState.isKeyword) {
            return this.compileVarDec(xml.concat(this.xmlWriter.getKeyword()));
        }

        if (tokenState.isSymbol && tokenState.value === Symbol.Comma) {
            return this.compileVarDec(xml.concat(this.xmlWriter.getSymbol()));
        }

        return this.compileVarDec(xml.concat(this.xmlWriter.getIdentifier()));
    }

    /** Compiles a sequence of statements not including the enclosing brackets.
     *  The current token must be a keyword if this function is entered
     *
     * Base case: the 'lookAheadToken' is a Symbol Bracket facing Left closing the statments
     */
    private compileStatements(xml: string): string {
        let nextXml: string;
        const currentToken = this.tokenizer.getCurrentToken();

        switch (currentToken) {
            case Keyword.Do:
                nextXml = this.compileDo(xml);
                break;
            case Keyword.Let:
                nextXml = this.compileLet(xml);
                break;
            case Keyword.While:
                nextXml = this.compileWhile(xml);
                break;
            case Keyword.Return:
                nextXml = this.compileReturn(xml);
                break;
            case Keyword.If:
                nextXml = this.compileIf(xml);
                break;
            default:
                throw new Error(`Failed to identify keyword: ${currentToken}`);
        }

        // base case -- if lookAhead is '}' pass execution back to caller to
        // handle the symbol
        if (this.tokenizer.lookAhead() === Symbol.CurlyLeft) {
            return nextXml;
        }

        // If the 'lookAhead' value is not a '}' then we are still compiling statements,
        // soadvance the currentToken to the lookAhead and proceed
        this.tokenizer.advance();
        return this.compileStatements(nextXml);
    }

    /** Compiles a do statement. Base case is Semi.
     * Must wrap in "<doStatement>"
     */
    private compileDo(xml: string): string {
        return "";
    }

    /** Compiles a let statement. Base case is Semi
     * Must wrap in "<letStatement>"
     */
    private compileLet(xml: string): string {
        return "";
    }

    /** Compiles a while statement. Can contain statements
     * Must wrap in "<whileStatement>"
     */
    private compileWhile(xml: string): string {
        return "";
    }

    /** Compiles a return statement
     * Must wrap in <returnStatement>
     */
    private compileReturn(xml: string): string {
        return "";
    }

    /** Compiles an if statement. Can contain statements
     * Must wrap in <ifStatement>
     */
    private compileIf(xml: string): string {
        return "";
    }

    /** Compiles an expression. Wrap calls to this method in <expression> tag */
    private compileExpression(xml: string, stopAtToken: string): string {
        let currentToken = this.tokenizer.getCurrentToken();

        if (SymbolTable.isOp(currentToken)) {
            const nextXml = xml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();
            return this.compileExpression(nextXml, stopAtToken);
        }

        // Else the currentToken must be the start of a <term>
        const xmlToPass = xml.concat("<term>");
        const nextXml = this.compileTerm(xmlToPass).concat("</term>");

        // Building the term will have advanced() the currentToken pointer
        currentToken = this.tokenizer.getCurrentToken();

        if (currentToken === stopAtToken) {
            return nextXml;
        }

        this.tokenizer.advance();
        return this.compileExpression(nextXml, stopAtToken);
    }

    /** Compile a term. Must decide between the alternative of a variable,
     * an array entry and a subroutine call.
     * Only one condition is recursive */
    private compileTerm(xml: string): string {
        const tokenState: CurrentToken = this.tokenizer.getCurrentTokenState();
        const lookAhead: string = this.tokenizer.lookAhead();

        // Needs to determine if we are dealing with a subroutineCall which is wrapped in <term>
        // See line 608 square game
        if (tokenState.isIdentifier && lookAhead === Symbol.Period) {
            // compile subroutine call -- the currentToken will point to ";"
            // with this return
            return this.compileSubroutineCall(xml);
        }

        // Needs to determine if we are dealing with a term including '[' ']' for array access
        if (tokenState.isIdentifier && lookAhead === Symbol.BracketRight) {
            // compile array var access
            // Get idnetifier for array variable name
            let nextXml = xml.concat(this.xmlWriter.getIdentifier());
            this.tokenizer.advance();

            // Get the symbol bracket right
            nextXml = nextXml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();

            // Compile the expression between the brackets. Stop at ']'
            nextXml = nextXml.concat("<expression");
            nextXml = this.compileExpression(nextXml, Symbol.BracketLeft);
            nextXml = nextXml.concat("</expression>");

            // The currentToken should now be pointing at ']' with exp above done.
            // Append it to this <term> xml and return
            return nextXml.concat(this.xmlWriter.getSymbol());
        }

        // Needs to determine if we are dealing with a `unaryOp term`
        // This bit is recursive - unaryop term
        if (SymbolTable.isUnaryOp(tokenState.value)) {
            let nextXml = xml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();

            // Are the term tags necessary? can't find an example - only recursive case
            nextXml = nextXml.concat("<term>");
            nextXml = this.compileTerm(nextXml);
            return nextXml.concat("</term>");
        }

        // Needs to determine if we are dealing with a `( expression )` where the <term> is the wrapped expression
        if (tokenState.value === Symbol.ParenRight) {
            let nextXml = xml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();

            // Compile the expression within the parens. Stop at ")"
            nextXml = nextXml.concat("<expression>");
            nextXml = this.compileExpression(nextXml, Symbol.ParenLeft);
            nextXml = nextXml.concat("</expression>");

            // Append the ')' which is a part of this 'term' and advance()
            // since we appended the currentToken
            nextXml = nextXml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();

            return nextXml;
        }

        // Else return <integerConstant> if isIntConst
        if (tokenState.isIntConst) {
            const nextXml = xml.concat(this.xmlWriter.getIntConst());
            this.tokenizer.advance();
            return nextXml;
        }

        // Else return <stringConstant> if isStringConst
        if (tokenState.isStringConst) {
            const nextXml = xml.concat(this.xmlWriter.getStringConst());
            this.tokenizer.advance();
            return nextXml;
        }

        // Else return <keyword> if isKeywordConst
        if (tokenState.isKeyword) {
            const nextXml = xml.concat(this.xmlWriter.getKeyword());
            this.tokenizer.advance();
            return nextXml;
        }

        if (tokenState.isIdentifier) {
            const nextXml = xml.concat(this.xmlWriter.getIdentifier());
            this.tokenizer.advance();
            return nextXml;
        }

        throw new Error(`Failed to identify <term> for ${tokenState.value}`);
    }

    private compileSubroutineCall(xml: string): string {
        // Append the identifier class name
        let nextXml = xml.concat(this.xmlWriter.getIdentifier());
        this.tokenizer.advance();

        // Append the period symbol
        nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();

        // Append the function | method name identifier
        nextXml = nextXml.concat(this.xmlWriter.getIdentifier());
        this.tokenizer.advance();

        // Append the open paren symbol
        nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();

        // compile expression list
        nextXml = nextXml.concat("<expressionList>");
        nextXml = this.compileExpressionList(nextXml);
        nextXml = nextXml.concat("</expressionList>");

        // The current token should now be ParenLeft. That's how
        // expressionList knows to stop executing. Paren symbols
        // are not included within <expressionList> tags
        nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();

        // tokenizer now points to ";" Semi. Pass execution back to caller
        // to handle the Semi. In a do statement, the semi is included within the
        // 'do' tags. As a term, the ';' is not included within the <term> tags
        return nextXml;
    }

    /** Compiles a possible empty comma-separated list of expressions */
    private compileExpressionList(xml: string): string {
        const tokenState: CurrentToken = this.tokenizer.getCurrentTokenState();

        // base case: currentToken == ParenLeft, just return built out xml
        // and dont advance the pointer. The Paren is not included as a child of <expressionList>
        if (tokenState.value === Symbol.ParenLeft) {
            return xml;
        }

        // else if Symbol.Comma then proceed to compile expressionlist and advance()
        if (tokenState.value === Symbol.Comma) {
            const nextXml = xml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();
            return this.compileExpressionList(nextXml);
        }

        // else we need to recursively compile an expression and call this function
        // compileExpression will advance() as it needs
        let nextXml = xml.concat("<expression>");
        nextXml = this.compileExpression(nextXml, Symbol.ParenLeft);

        return this.compileExpressionList(nextXml.concat("</expression>"));
    }
}
