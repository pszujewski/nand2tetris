import JackTokenizer from "../JackTokenizer";
import KeywordTable from "../KeywordTable";
import Symbol from "../../types/Symbol";
import SymbolTable from "../SymbolTable";
import CurrentToken from "../../types/CurrentToken";
import Keyword from "../../types/Keyword";
import VMWriter from "./VMWriter";
import VMSegment from "./VMSegment";
import IdentifierTable from "./IdentifierTable";
import { Identifier, VariableKind } from "../../types/Scope";
import Segment from "../../types/Segment";
import VMCommand from "../../types/VMCommand";

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
    public compileClass(): void {
        this.tokenizer.advance();
        const tokenState: CurrentToken = this.tokenizer.getCurrentTokenState();

        // base case
        if (tokenState.isSymbol && tokenState.value === Symbol.CurlyLeft) {
            // Compilation finished
            return;
        }

        if (KeywordTable.isClass(tokenState.value)) {
            // Continue compilation. We are compiling the root class
            return this.compileClass();
        }

        if (tokenState.isIdentifier) {
            this.identifierTable.setNameOfClass(tokenState.value);
            return this.compileClass();
        }

        if (tokenState.isSymbol && tokenState.value === Symbol.CurlyRight) {
            // The start of the class. We are just begining to compile the body
        }

        if (KeywordTable.isClassVarDec(tokenState.value)) {
            this.compileClassVarDec();
            return this.compileClass();
        }

        if (KeywordTable.isSubroutineDec(tokenState.value)) {
            this.compileSubroutine();
            return this.compileClass();
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

        this.tokenizer.advance();
        this.compileVarDec(identifier);
    }

    // Not recursive. The currentToken should be the first keyword in the
    // function definition when this function is entered (function | method | constructor)
    private compileSubroutine() {
        this.identifierTable.startSubroutine();

        // Evaluate the <keyword> (function | method | constructor)
        const token = this.tokenizer.getCurrentToken();
        this.identifierTable.setSubroutineType(token);

        // Only for methods, the first argument must be 'this'
        if (this.identifierTable.isMethodSubroutine()) {
            const argument: Identifier = {
                name: Keyword.This,
                type: this.identifierTable.getNameOfClass(),
                kind: VariableKind.ARG,
            };
            this.identifierTable.define(argument);
        }

        // advance() to the return type <keyword> or <identifier>
        this.tokenizer.advance();
        const tokenState: CurrentToken = this.tokenizer.getCurrentTokenState();

        this.identifierTable.setIsVoidReturnType(
            tokenState.value === Keyword.Void
        );

        if (tokenState.isKeyword) {
            console.log("The return type is a primitive");
        } else {
            console.log("The return type is a defined class");
        }
        // Advance past what was either keyword or identifier for the return type
        this.tokenizer.advance();

        // Save the function | method | constructor name <identifier> and advance()
        const name: string = this.tokenizer.getCurrentToken();
        this.identifierTable.setSubroutineName(name);

        this.tokenizer.advance();

        // currentToken is open paren for the parameter list
        // Advance past it and compile any arguments for the subroutine
        this.tokenizer.advance();

        // Add Arguments to identifier table. The currentToken is now either
        // pointing to the first ARG type or to closing of parens (if no args)
        this.compileParameterList();

        // The currentToken should now be '{' with param list finished.
        if (this.tokenizer.getCurrentToken() !== Symbol.CurlyRight) {
            throw new Error("Expected Curly Right to start subroutine body");
        }

        this.tokenizer.advance();

        const nameOfClass = this.identifierTable.getNameOfClass();
        this.vmWriter.writeFunction(`${nameOfClass}.${name}`);

        if (this.identifierTable.isMethodSubroutine()) {
            this.vmWriter.writePush(Segment.ARG, 0);
            this.vmWriter.writePop(Segment.POINTER, 0);
        }

        if (this.identifierTable.isConstructorSubroutine()) {
            const nFields: number = this.identifierTable.getVarCountForKind(
                VariableKind.FIELD
            );
            this.vmWriter.writePush(Segment.CONST, nFields);
            this.vmWriter.writeCall("Memory.alloc", 1);
            this.vmWriter.writePop(Segment.POINTER, 0);
        }

        const nLocals: number = this.compileSubroutineBody();
        this.vmWriter.writeLocalsCountToFunctionDefinition(nLocals);
    }

    /** Compile a possibly empty parameter list */
    private compileParameterList(): void {
        const tokenState: CurrentToken = this.tokenizer.getCurrentTokenState();

        // base case: finished compiling arguments for subroutine. Advance past closed paren
        if (tokenState.isSymbol && tokenState.value === Symbol.ParenLeft) {
            this.tokenizer.advance();
            return;
        }

        // Check for comma which doesn't need to be compiled
        if (tokenState.isSymbol && tokenState.value === Symbol.Comma) {
            this.tokenizer.advance();
            return this.compileParameterList();
        }

        // Create a new Identifier and add the 'type' which is the currentToken
        const argument: Identifier = {
            name: "",
            type: tokenState.value,
            kind: VariableKind.ARG,
        };

        // Advance to the name of the identifier and add it to the definition table
        this.tokenizer.advance();
        argument.name = this.tokenizer.getCurrentToken();

        this.identifierTable.define(argument);

        this.tokenizer.advance();
        return this.compileParameterList();
    }

    /**
     *
     * Compile a complete subroutine definition and return the total count of defined local vars
     */
    private compileSubroutineBody(): number {
        const tokenState: CurrentToken = this.tokenizer.getCurrentTokenState();

        // base case: the token is CurlyLeft. Advance past it and end
        if (tokenState.isSymbol && tokenState.value === Symbol.CurlyLeft) {
            this.tokenizer.advance();
            return this.identifierTable.countLocalVarsForCurrentSubroutine();
        }

        // Compile any "local" varDecs
        if (tokenState.isKeyword && tokenState.value === Keyword.Var) {
            const localVariable: Identifier = {
                name: "",
                type: "",
                kind: VariableKind.VAR,
            };

            this.compileVarDec(localVariable);
            // the currentToken will now be pointing at the ';' so advance()
            this.tokenizer.advance();
            return this.compileSubroutineBody();
        }

        // Anything else should be a 'keyword' indicating the start of a 'statement'
        this.compileStatements();
        return this.compileSubroutineBody();
    }

    /** Compiles a var declaration
     *  The given identifier should already have the 'kind' determined
     *  The problem here is that 'type' is not always a 'keyword'. It
     *  can also be a className, so this can't really be recursive but
     *  instead uses a 'while' loop.
     */
    private compileVarDec(identifier: Identifier): Identifier[] {
        const identifiers: Identifier[] = [];

        // The current token is now the 'type' in the declaration
        identifier.type = this.tokenizer.getCurrentToken();
        this.tokenizer.advance();

        // The current token is now the 'varName' in the declaration
        identifier.name = this.tokenizer.getCurrentToken();
        this.tokenizer.advance();

        this.identifierTable.define(identifier);
        identifiers.push(identifier);

        while (this.tokenizer.getCurrentToken() === Symbol.Comma) {
            // Advance past the comma to the next varName and create new identifier
            this.tokenizer.advance();
            const name: string = this.tokenizer.getCurrentToken();

            const anotherIdentifier: Identifier = { ...identifier, name };
            this.identifierTable.define(anotherIdentifier);

            identifiers.push(anotherIdentifier);
            this.tokenizer.advance();
        }

        // Should be finished comiling the varDec. Don't advance past the Semi here!!!
        if (SymbolTable.isSemi(this.tokenizer.getCurrentToken())) {
            return identifiers;
        } else {
            throw new Error("VarDecs should end with Semi symbol");
        }
    }

    /**
     * Compiles a sequence of statements not including the enclosing brackets.
     * The current token must be a keyword if this function is entered
     */
    private compileStatements(): void {
        const currentToken = this.tokenizer.getCurrentToken();

        if (currentToken === Symbol.CurlyLeft) {
            return;
        }

        switch (currentToken) {
            case Keyword.Do:
                this.compileDo();
                break;
            case Keyword.Let:
                this.compileLet();
                break;
            case Keyword.While:
                this.compileWhile();
                break;
            case Keyword.Return:
                this.compileReturn();
                break;
            case Keyword.If:
                this.compileIf();
                break;
            default:
                throw new Error(`Failed to identify keyword: ${currentToken}`);
        }

        // base case: if the currentToken is '}' pass execution back to the caller
        if (this.tokenizer.getCurrentToken() === Symbol.CurlyLeft) {
            return;
        }
        // If the currentToken value is not '}' then we are still compiling statements
        return this.compileStatements();
    }

    /** Compiles a do statement. Base case is Semi.
     * Must wrap in "<doStatement>"
     */
    private compileDo(): void {
        // Advance past the 'do' keyword
        this.tokenizer.advance();

        // Compile the subroutine call which currentToken now starts
        this.compileSubroutineCall();

        // Pop the 'void' constant '0' and 'ignore' by popping to temp (?)
        this.vmWriter.writePop(Segment.TEMP, 2);

        // CurrentToken should now be ";" Close out the 'do' statement
        this.tokenizer.advance();
        return;
    }

    /**
     * Compiles a let statement. Base case is Semi
     * Must wrap in "<letStatement>"
     */
    private compileLet(): void {
        // 'let' keyword, advance past it
        this.tokenizer.advance();

        // varName identifier; save it and advance()
        const identifierName: string = this.tokenizer.getIdentifier();
        this.tokenizer.advance();

        // Get identifier state kind and idx
        const kind: VariableKind = this.identifierTable.kindOf(identifierName);
        const seg: Segment = this.vmSegment.getFromKind(kind);
        const idx: number = this.identifierTable.indexOf(identifierName);

        const tokenState: CurrentToken = this.tokenizer.getCurrentTokenState();

        // The currentToken is now either the start of an expression '[' or 'equals'

        if (tokenState.value === Symbol.BracketRight) {
            // The identifier is an 'array.' Advance past the bracket symbol (outside the expression)
            this.tokenizer.advance();

            // 'Push' array to set 'that' pointer. This is The memory address of the array's 'base'
            this.vmWriter.writePush(seg, idx);

            // use compileExpression to push the array index expression to the top of stack
            // Add them together 'base of array' + index value
            this.compileExpression(Symbol.BracketLeft);
            this.vmWriter.writeArithmetic(VMCommand.Add);

            // Top of the stack now holds the exact memory address we need to manipulate
            // Pop it to segment 'pointer 1'
            this.vmWriter.writePop(Segment.POINTER, 1); // 'that' pointer for arrays

            // The currentToken is now "]". advance to the '=' symbol
            this.tokenizer.advance();

            // The currentToken is now "=". Advance.
            this.tokenizer.advance();
            this.compileExpression(Symbol.Semi); // Until currentToken = ";"

            // The value to save is now on the top of the stack. 'that 0' gets its address from pointer 1.
            this.vmWriter.writePop(Segment.THAT, 0);
        } else {
            // The currentToken is '=' equals. Advance past it.
            this.tokenizer.advance();
            this.compileExpression(Symbol.Semi);

            // The value from compileExpression is now on top of the stack. Pop to the non-array variable
            this.vmWriter.writePop(seg, idx);
        }
        // Regardless of case, currentToken == ";" Advance past the Semi and close out 'let'
        this.tokenizer.advance();
        return;
    }

    /**
     * Compiles a while statement. Can contain statements
     * Must wrap in "<whileStatement>"
     */
    private compileWhile(): void {
        // Skip 'while' keyword
        this.tokenizer.advance();
        // Skip the open paren
        this.tokenizer.advance();

        // Produce this whileStatement's 'labelIndex' for uniqueness
        const labelIndex: number = this.vmWriter.getLabelIndex();

        const whileStart = "while_start";
        const whileEnd = "while_end";

        // currentToken should be pointing at the first token in the conditional expression
        // VM label L1 (pg. 233)
        this.vmWriter.writeLabel(whileStart, labelIndex);

        // Compile expression value to top of stack. 'Not' the value.
        this.compileExpression(Symbol.ParenLeft);
        this.vmWriter.writeArithmetic(VMCommand.Not);

        // Advance past paren close. currentToken = '{'. Evaluate top of stack value now.
        this.tokenizer.advance();
        this.vmWriter.writeIf(whileEnd, labelIndex);

        // Advance past '{' signaling start of statements block, and to the first keyword in statements
        this.tokenizer.advance();

        this.compileStatements();
        this.vmWriter.writeGoto(whileStart, labelIndex);

        // End label for 'while' statement
        this.vmWriter.writeLabel(whileEnd, labelIndex);

        // The currentToken is now '}' close of while statement
        this.tokenizer.advance();
        return;
    }

    /** Compiles a return statement
     * Must wrap in <returnStatement>
     */
    private compileReturn(): void {
        // the 'return' keyword is the currentToken
        this.tokenizer.advance();

        if (this.tokenizer.getCurrentToken() === Symbol.Semi) {
            // Then we are returning 'undefined.' currentToken is Symbol.Semi
            this.vmWriter.writePush(Segment.CONST, 0); // push constant 0
            this.vmWriter.writeReturn();
            // Advance past the Semi
            this.tokenizer.advance();
            return;
        }

        this.compileExpression(Symbol.Semi);

        // The Semi is the currentToken. Return and advance
        this.vmWriter.writeReturn();
        this.tokenizer.advance();
        return;
    }

    /** Compiles an if statement. Can contain statements
     * Must wrap in <ifStatement>, needs to include possible 'else'
     */
    private compileIf(): void {
        const labelIndex: number = this.vmWriter.getLabelIndex();

        const ifStatementEnd = "if_statement_end";
        const elseBodyStart = "else_body_start";

        // Skip 'if' keyword token and open paren
        this.tokenizer.advance();
        this.tokenizer.advance();

        // Compile expression and 'Not' top of stack value produced
        this.compileExpression(Symbol.ParenLeft);
        this.vmWriter.writeArithmetic(VMCommand.Not);

        // Advance past close paren. if ~(conditionalExpression) go-to else-block start
        this.tokenizer.advance();
        this.vmWriter.writeIf(elseBodyStart, labelIndex);

        // currentToken == "{" start of statements. Advance to first keyword in 'statements'
        this.tokenizer.advance();
        this.compileStatements();

        // The currentToken is now '}' end of if-block. Advance past it.
        this.tokenizer.advance();

        // Goto L2 ifStatementEnd by default
        this.vmWriter.writeGoto(ifStatementEnd, labelIndex);
        this.vmWriter.writeLabel(elseBodyStart, labelIndex);

        if (this.tokenizer.getCurrentToken() === Keyword.Else) {
            // Skip the 'else' keyword and '{' statments start token.
            this.tokenizer.advance();
            this.tokenizer.advance();

            // Compile statements to stack and skip '}' 'statements' end-token.
            this.compileStatements();
            this.tokenizer.advance();
        }

        // Regardless, this is the end of the if-statement. Return control to compileStatements()
        this.vmWriter.writeLabel(ifStatementEnd, labelIndex);
        return;
    }

    /** Compiles an expression. */
    private compileExpression(stopAtToken: string): void {
        let currentToken = this.tokenizer.getCurrentToken();

        if (currentToken === stopAtToken || currentToken === Symbol.Comma) {
            return;
        }

        // We need to determine that this truly is an "Op" and is not
        // actually a "Unary Op". If it's Unary Op, we need to comileTerm()
        // In other words, we need to let compileTerm treat the symbol as a
        // Unary Op. This is difficult though because '-' can be either
        // "Op" or "Unary Op."

        if (SymbolTable.isOp(this.tokenizer)) {
            const vmOp: VMCommand = SymbolTable.getVMOperation(currentToken);
            this.tokenizer.advance();

            this.compileExpression(stopAtToken);
            return this.vmWriter.writeArithmetic(vmOp);
        }

        // The currentToken must now be the start of a <term>
        this.compileTerm();

        // Building the term will have advanced() the currentToken pointer
        currentToken = this.tokenizer.getCurrentToken();

        if (currentToken === stopAtToken || currentToken === Symbol.Comma) {
            return;
        }

        return this.compileExpression(stopAtToken);
    }

    /** Compile a term. Must decide between the alternative of a variable,
     * an array entry and a subroutine call.
     * Only one condition is recursive */
    private compileTerm(): void {
        const tokenState: CurrentToken = this.tokenizer.getCurrentTokenState();
        const lookAhead: string = this.tokenizer.lookAhead();

        // Needs to determine if we are dealing with a subroutineCall which is wrapped in <term>
        // See line 608 square game
        if (tokenState.isIdentifier && lookAhead === Symbol.Period) {
            // compile subroutine call -- the currentToken will point to ";"
            // with this return
            return this.compileSubroutineCall();
        }

        // Needs to determine if we are dealing with a term including '[' ']' for array access
        if (tokenState.isIdentifier && lookAhead === Symbol.BracketRight) {
            // Get identifier state kind and idx
            const identifier: string = tokenState.value;
            // Advance to "["
            this.tokenizer.advance();

            const kind: VariableKind = this.identifierTable.kindOf(identifier);
            const idx: number = this.identifierTable.indexOf(identifier);
            const seg: Segment = this.vmSegment.getFromKind(kind);

            // 'Push' array to set 'that' pointer. This is The memory address of the array's 'base'
            this.vmWriter.writePush(seg, idx);

            // Advance to the expression start and compile the expression between the brackets. Stop at ']'
            this.tokenizer.advance();
            this.compileExpression(Symbol.BracketLeft);

            // add together to get correct 'that' pointer and pop it to 'pointer 1' for 'that' segment
            this.vmWriter.writeArithmetic(VMCommand.Add);
            this.vmWriter.writePop(Segment.POINTER, 1);

            // The currentToken should now be pointing at ']' with exp above done. Advance past it
            this.tokenizer.advance();

            // Push 'that 0' to the stack. this is the value at 'array[expression]'
            this.vmWriter.writePush(Segment.THAT, 0);
            return;
        }

        // Needs to determine if we are dealing with a `unaryOp term`
        // This bit is recursive - unaryop term
        if (SymbolTable.isUnaryOp(tokenState.value)) {
            const token = this.tokenizer.getCurrentToken();
            this.tokenizer.advance();

            this.compileTerm();

            const cmd: VMCommand = SymbolTable.getVMUnaryOp(token);
            return this.vmWriter.writeArithmetic(cmd);
        }

        // Needs to determine if we are dealing with a `( expression )` where the <term> is the wrapped expression
        if (tokenState.value === Symbol.ParenRight) {
            // Ignore parens. Compile the expression within the parens. Stop at ")".
            this.tokenizer.advance();
            this.compileExpression(Symbol.ParenLeft);

            this.tokenizer.advance();
            return;
        }

        // Else return <integerConstant> if isIntConst
        if (tokenState.isIntConst) {
            const intVal: number = this.tokenizer.getIntVal();
            this.tokenizer.advance();
            return this.vmWriter.writePush(Segment.CONST, intVal);
        }

        // Else return <stringConstant> if isStringConst
        if (tokenState.isStringConst) {
            const nextXml = xml.concat(this.xmlWriter.getStringConst());
            this.tokenizer.advance();
            return nextXml;
        }

        // Else return <keyword> if isKeywordConst
        if (tokenState.isKeyword) {
            return this.compileTermKeyword();
        }

        if (tokenState.isIdentifier) {
            // Resolve the identifier and push it to the top of the stack
            const identifierName = this.tokenizer.getIdentifier();

            const index: number = this.identifierTable.indexOf(identifierName);
            const kind: VariableKind = this.identifierTable.kindOf(
                identifierName
            );

            const segment: Segment = this.vmSegment.getFromKind(kind);
            this.vmWriter.writePush(segment, index);

            this.tokenizer.advance();
            return;
        }

        throw new Error(`Failed to identify <term> for ${tokenState.value}`);
    }

    // Null and False are mapped to the constant 0; True to the constant -1
    // The 'this' context is identified using the pointer segment at index '0'
    private compileTermKeyword(): void {
        const keyword = this.tokenizer.getKeyword();

        switch (keyword) {
            case Keyword.Null:
            case Keyword.False:
                this.vmWriter.writePush(Segment.CONST, 0);
                break;
            case Keyword.True:
                this.vmWriter.writePush(Segment.CONST, 1);
                this.vmWriter.writeArithmetic(VMCommand.Neg);
                break;
            case Keyword.This:
                this.vmWriter.writePush(Segment.POINTER, 0);
                break;
            default:
                break;
        }
    }

    private compileSubroutineCall(): void {
        // Append the className or the function | method name identifier
        const identifierTokenInCall: string = this.tokenizer.getIdentifier();
        this.tokenizer.advance();

        // If the token is now Period, then this is a method on a class instance
        // or it's a static function on a Class
        // If it's a ParenRight then it's a method on the current 'this' class
        const token: string = this.tokenizer.getCurrentToken();
        const isPeriod: boolean = token === Symbol.Period;

        const isMethod: boolean =
            isPeriod && this.identifierTable.exists(identifierTokenInCall);

        let vmNameOfFunc = "";

        if (isPeriod) {
            // then it's a method on a class instance or a static function on a class
            // Do same thing regardless
            vmNameOfFunc = `${identifierTokenInCall}.`;
            this.tokenizer.advance();

            // Append the function | method name identifier to the name
            vmNameOfFunc = vmNameOfFunc.concat(this.tokenizer.getIdentifier());
            this.tokenizer.advance();
        } else {
            // it should be currentClass.identifierName
            const currentClass: string = this.identifierTable.getNameOfClass();
            vmNameOfFunc = `${currentClass}.${identifierTokenInCall}`;
        }

        if (this.tokenizer.getCurrentToken() !== Symbol.ParenRight) {
            throw new Error("Invalid Function Call opening paren missing");
        }

        // Advance past the open paren symbol
        this.tokenizer.advance();

        if (isMethod) {
            // Push the identifier found at 'segment[idx]' to the stack now
            // since all methods expect argument[0] to be its 'this' context
            const kind: VariableKind = this.identifierTable.kindOf(
                identifierTokenInCall
            );
            const idx: number = this.identifierTable.indexOf(
                identifierTokenInCall
            );
            const segment: Segment = this.vmSegment.getFromKind(kind);
            this.vmWriter.writePush(segment, idx);
        }

        // compile expression list
        const initialCt = isMethod ? 1 : 0;
        const argsCt: number = this.compileExpressionList(initialCt);

        // The current token should now be ParenLeft. That's how
        // expressionList knows to stop executing.
        // Advance past it
        if (this.tokenizer.getCurrentToken() !== Symbol.ParenLeft) {
            throw new Error("Invalid Function Call closing paren missing");
        }
        this.tokenizer.advance();

        // Once arguments are pushed to the stack, output "call f"
        this.vmWriter.writeCall(vmNameOfFunc, argsCt);

        // tokenizer now points to ";" Semi. Pass execution back to caller
        // to handle the Semi. In a do statement, the semi is included within the
        // 'do' tags. As a term, the ';' is not included within the <term> tags
        return;
    }

    /**
     *
     * Compiles a possible empty comma-separated list of expressions */
    private compileExpressionList(argsCt: number): number {
        const tokenState: CurrentToken = this.tokenizer.getCurrentTokenState();

        // base case: currentToken == ParenLeft, just return built out xml
        // and dont advance the pointer. The Paren is not included as a child of <expressionList>
        if (tokenState.value === Symbol.ParenLeft) {
            return argsCt;
        }

        // else if Symbol.Comma then proceed to compile expressionlist and advance()
        if (tokenState.value === Symbol.Comma) {
            this.tokenizer.advance();
            return this.compileExpressionList(argsCt);
        }

        // else we need to recursively compile an expression and call this function
        // compileExpression will advance() as it needs
        this.compileExpression(Symbol.ParenLeft); // stop at ')' or Comma
        return this.compileExpressionList(argsCt + 1);
    }
}
