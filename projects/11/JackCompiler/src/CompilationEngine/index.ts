import JackTokenizer from "../JackTokenizer";
import KeywordTable from "../KeywordTable";
import Symbol from "../../types/Symbol";
import SymbolTable from "../SymbolTable";
import CurrentToken from "../../types/CurrentToken";
import Keyword from "../../types/Keyword";
import VMWriter from "./VMWriter";
import VMSegment from "./VMSegment";
import IdentifierTable from "./IdentifierTable";
import { Identifier } from "../../types/Scope";

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
    private vmSegment: VMSegment;
    private identifierTable: IdentifierTable;
    private vmWriter: VMWriter;

    constructor(tokenizer: JackTokenizer, writeToPath: string) {
        this.tokenizer = tokenizer;
        this.vmWriter = new VMWriter(writeToPath);
        this.vmSegment = new VMSegment();
        this.identifierTable = new IdentifierTable();
    }

    public compile(): Promise<void> {
        try {
            if (this.tokenizer.isFirstTokenClassKeyword()) {
                this.compileClass();
                return this.vmWriter.close();
            } else {
                throw new Error("Program must begin with a class declaration");
            }
        } catch (error) {
            throw error;
        }
    }

    /** Compiles a complete class */
    public compileClass(): string {
        this.tokenizer.advance();
        const tokenState: CurrentToken = this.tokenizer.getCurrentTokenState();

        // base case
        if (tokenState.isSymbol && tokenState.value === Symbol.CurlyLeft) {
            // Compilation finished
        }

        if (KeywordTable.isClass(tokenState.value)) {
            // Continue compilation. We are compiling the root class
        }

        if (tokenState.isIdentifier) {
            this.identifierTable.setNameOfClass(tokenState.value);
            return this.compileClass();
        }

        if (tokenState.isSymbol && tokenState.value === Symbol.CurlyRight) {
            // The start of the class. We are just begining to compile the body of the
        }

        if (KeywordTable.isClassVarDec(tokenState.value)) {
            this.compileClassVarDec();
            return this.compileClass();
        }

        if (KeywordTable.isSubroutineDec(tokenState.value)) {
            return this.compileClass(this.compileSubroutine(xml));
        }

        throw new Error("Failed to compile class");
    }

    /** Compiles a static declaration or a field declaration.
     * (static | field) type varName (, varName)*
     * */
    private compileClassVarDec() {
        const tokenState: CurrentToken = this.tokenizer.getCurrentTokenState();

        const identifier: Identifier = {
            name: "",
            type: "",
            kind: this.identifierTable.getVarKind(tokenState.value),
        };

        this.compileVarDec(identifier);
    }

    // Not recursive. The currentToken should be the first keyword in the
    // function definition when this function is entered (function | method | constructor)
    private compileSubroutine(xml: string): string {
        xml = xml.concat("<subroutineDec>");

        // Get the <keyword> (function | method | constructor)
        xml = xml.concat(this.xmlWriter.getKeyword());
        this.tokenizer.advance();

        // Get the return type <keyword> or <identifier>
        const tokenState: CurrentToken = this.tokenizer.getCurrentTokenState();

        if (tokenState.isKeyword) {
            xml = xml.concat(this.xmlWriter.getKeyword());
        } else {
            xml = xml.concat(this.xmlWriter.getIdentifier());
        }

        // Advance past what was either keyword or identifier
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
        let nextXml: string;
        const tokenState: CurrentToken = this.tokenizer.getCurrentTokenState();

        // base case - The Curly baces are included as the first and last children to <subroutineBody>
        if (tokenState.isSymbol && tokenState.value === Symbol.CurlyLeft) {
            return xml.concat(this.xmlWriter.getSymbol());
        }

        // Start of subroutine body (braces are included as children of <subroutineBody>)
        if (tokenState.isSymbol && tokenState.value === Symbol.CurlyRight) {
            nextXml = xml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();
            return this.compileSubroutineBody(nextXml);
        }

        // Compile any varDecs
        if (tokenState.isKeyword && tokenState.value === Keyword.Var) {
            const keywordXml = this.xmlWriter.getKeyword();
            const xmlToPass = xml.concat("<varDec>").concat(keywordXml);

            nextXml = this.compileVarDec(xmlToPass).concat("</varDec>");
            // the currentToken will now be pointing at the ';' so advance()
            this.tokenizer.advance();

            return this.compileSubroutineBody(nextXml);
        }

        // Anything else should be a keyword indicating the start of a 'statement'
        nextXml = xml.concat("<statements>");

        return this.compileSubroutineBody(
            this.compileStatements(nextXml).concat("</statements>")
        );
    }

    /** Compiles a var declaration
     *  The given identifier should already have the 'kind' determined
     *  The problem here is that 'type' is not always a 'keyword'. It
     *  can also be a className, so this can't really be recursive but
     *  instead use a 'while' loop.
     */
    private compileVarDec(identifier: Identifier) {
        this.tokenizer.advance();

        // The current token is now the 'type' in the declaration
        identifier.type = this.tokenizer.getCurrentToken();
        this.tokenizer.advance();

        // The current token is now the 'varName' in the declaration
        identifier.name = this.tokenizer.getCurrentToken();
        this.tokenizer.advance();

        this.identifierTable.define(identifier);

        while (this.tokenizer.getCurrentToken() === Symbol.Comma) {
            // Advance past the comma to the next varName and create new identifier
            this.tokenizer.advance();
            const name: string = this.tokenizer.getCurrentToken();

            const anotherIdentifier: Identifier = { ...identifier, name };
            this.identifierTable.define(anotherIdentifier);

            this.tokenizer.advance();
        }

        // Should be finished comiling the varDec
        if (SymbolTable.isSemi(this.tokenizer.getCurrentToken())) {
            return;
        } else {
            throw new Error("VarDecs should end with Semi symbol");
        }
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

        // base case: if the currentToken is '}' pass execution back to the caller
        // !Set new breakpoint here. Last error throw was Failed to identify keyword ";"
        if (this.tokenizer.getCurrentToken() === Symbol.CurlyLeft) {
            return nextXml;
        }
        // If the currentToken value is not '}' then we are still compiling statements
        return this.compileStatements(nextXml);
    }

    /** Compiles a do statement. Base case is Semi.
     * Must wrap in "<doStatement>"
     */
    private compileDo(xml: string): string {
        let nextXml: string = xml.concat("<doStatement>");

        // Append the 'do' keyword
        nextXml = nextXml.concat(this.xmlWriter.getKeyword());
        this.tokenizer.advance();

        // Compile the subroutine call
        nextXml = this.compileSubroutineCall(nextXml);

        // Close out the do statement with the semi
        nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();

        return nextXml.concat("</doStatement>");
    }

    /** Compiles a let statement. Base case is Semi
     * Must wrap in "<letStatement>"
     */
    private compileLet(xml: string): string {
        let nextXml: string = xml.concat("<letStatement>");

        // Append 'let' keyword
        nextXml = nextXml.concat(this.xmlWriter.getKeyword());
        this.tokenizer.advance();

        // Append varName identifier
        nextXml = nextXml.concat(this.xmlWriter.getIdentifier());
        this.tokenizer.advance();

        const tokenState: CurrentToken = this.tokenizer.getCurrentTokenState();

        // The currentToken is now either the start of an expression or 'equals'

        if (tokenState.isSymbol && tokenState.value === Symbol.Equals) {
            nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        } else if (tokenState.value === Symbol.BracketRight) {
            // Append the bracket symbol outside the expression
            nextXml = nextXml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();

            nextXml = nextXml.concat("<expression>");
            nextXml = this.compileExpression(nextXml, Symbol.BracketLeft);
            nextXml = nextXml.concat("</expression>");

            // The currentToken is "]". This should NOT be included in the <expression>
            // Append and advance to the '=' symbol
            nextXml = nextXml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();

            // The currentToken is now "=". Append as a Symbol.
            nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        }

        // Regardless of case, the last token compiled was '=' symbol
        // Advance past it and compile the final <expression>
        this.tokenizer.advance();
        nextXml = nextXml.concat("<expression>");

        nextXml = this.compileExpression(nextXml, Symbol.Semi);
        nextXml = nextXml.concat("</expression>");

        // Append the Semi and close out 'let' advancing outside the statement
        nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();

        return nextXml.concat("</letStatement>");
    }

    /** Compiles a while statement. Can contain statements
     * Must wrap in "<whileStatement>"
     */
    private compileWhile(xml: string): string {
        let nextXml: string = xml.concat("<whileStatement>");

        // Append 'while' keyword
        nextXml = nextXml.concat(this.xmlWriter.getKeyword());
        this.tokenizer.advance();

        // Append the open paren
        nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();

        // Now currentToken should be pointing at the first token in
        // an <expression>
        nextXml = nextXml.concat("<expression>");
        nextXml = this.compileExpression(nextXml, Symbol.ParenLeft);
        nextXml = nextXml.concat("</expression>");

        // The currentToken is now pointing at the closing paren
        nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();

        // Append the '{' signaling start of statements block
        // and advance to the first keyword in statements
        nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();

        nextXml = nextXml.concat("<statements>");
        nextXml = this.compileStatements(nextXml);
        nextXml = nextXml.concat("</statements>");

        // The currentToken is now '}' close of while statement
        // Append and advance past it and therefore the while statement
        nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();

        return nextXml.concat("</whileStatement>");
    }

    /** Compiles a return statement
     * Must wrap in <returnStatement>
     */
    private compileReturn(xml: string): string {
        let nextXml: string = xml.concat("<returnStatement>");

        // Append the 'return' keyword
        nextXml = nextXml.concat(this.xmlWriter.getKeyword());
        this.tokenizer.advance();

        if (this.tokenizer.getCurrentToken() === Symbol.Semi) {
            // Append Semi and advance
            nextXml = nextXml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();
            return nextXml.concat("</returnStatement>");
        }

        nextXml = nextXml.concat("<expression>");
        nextXml = this.compileExpression(nextXml, Symbol.Semi);
        nextXml = nextXml.concat("</expression>");

        // Append the Semi which is the currentToken and advance
        nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();

        return nextXml.concat("</returnStatement>");
    }

    /** Compiles an if statement. Can contain statements
     * Must wrap in <ifStatement>, needs to include possible 'else'
     */
    private compileIf(xml: string): string {
        let nextXml: string = xml.concat("<ifStatement>");

        nextXml = this.compileConditional(nextXml);

        if (this.tokenizer.getCurrentToken() === Keyword.Else) {
            // Append 'else' conditional
            nextXml = this.compileConditional(nextXml);
        }

        return nextXml.concat("</ifStatement>");
    }

    private compileConditional(xml: string): string {
        let nextXml: string;

        // Append the keyword (if or else)
        nextXml = xml.concat(this.xmlWriter.getKeyword());
        this.tokenizer.advance();

        if (this.tokenizer.getCurrentToken() === Symbol.ParenRight) {
            // Open Paren
            nextXml = nextXml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();

            // The expression
            nextXml = nextXml.concat("<expression>");
            nextXml = this.compileExpression(nextXml, Symbol.ParenLeft);
            nextXml = nextXml.concat("</expression>");

            // Close Paren
            nextXml = nextXml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();
        }

        // Append the '{' signaling start of statements block
        // and advance to the first keyword in 'statements'
        nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();

        nextXml = nextXml.concat("<statements>");
        nextXml = this.compileStatements(nextXml);
        nextXml = nextXml.concat("</statements>");

        // The currentToken is now '}'. Append and advance
        nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();

        return nextXml;
    }

    /** Compiles an expression. Wrap calls to this method in <expression> tag */
    private compileExpression(xml: string, stopAtToken: string): string {
        let nextXml: string = xml;
        let currentToken = this.tokenizer.getCurrentToken();

        if (currentToken === stopAtToken || currentToken === Symbol.Comma) {
            return xml;
        }

        // We need to determine that this truly is an "Op" and is not
        // actually a "Unary Op". If it's Unary Op, we need to comileTerm()
        // In other words, we need to let compileTerm treat the symbol as a
        // Unary Op. This is difficult though because '-' can be either
        // "Op" or "Unary Op."

        // Update SymbolTable.isOp() to take in the whole tokenizer and determine
        // that we are really dealing with an "Op" and not actually a "UnaryOp"
        if (SymbolTable.isOp(this.tokenizer)) {
            nextXml = xml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();
            // return this.compileExpression(nextXml, stopAtToken);
        }

        // The currentToken must now be the start of a <term>
        nextXml = this.compileTerm(nextXml.concat("<term>")).concat("</term>");

        // Building the term will have advanced() the currentToken pointer
        currentToken = this.tokenizer.getCurrentToken();

        if (currentToken === stopAtToken || currentToken === Symbol.Comma) {
            return nextXml;
        }

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
            nextXml = nextXml.concat("<expression>");
            nextXml = this.compileExpression(nextXml, Symbol.BracketLeft);
            nextXml = nextXml.concat("</expression>");

            // The currentToken should now be pointing at ']' with exp above done.
            // Append it to this <term> xml and return
            nextXml = nextXml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();
            return nextXml;
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
            // DO NOT ADD <term> TAGS HERE!!!!
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
        // Append the className or the function | method name identifier
        let nextXml = xml.concat(this.xmlWriter.getIdentifier());
        this.tokenizer.advance();

        // If the token is now Period, then this is a method on a class instance
        // If it's a ParenRight then it's a method on the current 'this' class
        if (this.tokenizer.getCurrentToken() === Symbol.Period) {
            // Append the period symbol
            nextXml = nextXml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();

            // Append the function | method name identifier
            nextXml = nextXml.concat(this.xmlWriter.getIdentifier());
            this.tokenizer.advance();
        }

        if (this.tokenizer.getCurrentToken() !== Symbol.ParenRight) {
            throw new Error("Invalid Function Call");
        }

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
