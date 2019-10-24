"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var KeywordTable_1 = __importDefault(require("../KeywordTable"));
var Symbol_1 = __importDefault(require("../../types/Symbol"));
var SymbolTable_1 = __importDefault(require("../SymbolTable"));
var XMLWriter_1 = __importDefault(require("./XMLWriter"));
var Keyword_1 = __importDefault(require("../../types/Keyword"));
var CompilationEngine = (function () {
    function CompilationEngine(tokenizer, writeToPath) {
        this.tokenizer = tokenizer;
        this.xmlWriter = new XMLWriter_1.default(tokenizer, writeToPath);
    }
    CompilationEngine.prototype.compile = function () {
        var xml;
        try {
            if (this.tokenizer.isFirstTokenClassKeyword()) {
                xml = "<class>" + this.compileClass() + "</class>";
                this.xmlWriter.toFile(xml);
            }
            else {
                throw new Error("Program must begin with a class declaration");
            }
        }
        catch (error) {
            throw error;
        }
    };
    CompilationEngine.prototype.compileClass = function (xmlRoot) {
        if (xmlRoot === void 0) { xmlRoot = ""; }
        var xml = xmlRoot;
        this.tokenizer.advance();
        var tokenState = this.tokenizer.getCurrentTokenState();
        if (tokenState.isSymbol && tokenState.value === Symbol_1.default.CurlyLeft) {
            return xml.concat(this.xmlWriter.getSymbol());
        }
        if (KeywordTable_1.default.isClass(tokenState.value)) {
            return this.compileClass(xml.concat(this.xmlWriter.getKeyword()));
        }
        if (tokenState.isIdentifier) {
            return this.compileClass(xml.concat(this.xmlWriter.getIdentifier()));
        }
        if (tokenState.isSymbol && tokenState.value === Symbol_1.default.CurlyRight) {
            return this.compileClass(xml.concat(this.xmlWriter.getSymbol()));
        }
        if (KeywordTable_1.default.isClassVarDec(tokenState.value)) {
            var nextXml = xml.concat("<classVarDec>");
            nextXml = nextXml.concat(this.xmlWriter.getKeyword());
            return this.compileClass(this.compileClassVarDec(nextXml));
        }
        if (KeywordTable_1.default.isSubroutineDec(tokenState.value)) {
            return this.compileClass(this.compileSubroutine(xml));
        }
        throw new Error("Failed to compile class");
    };
    CompilationEngine.prototype.compileClassVarDec = function (xml) {
        return this.compileVarDec(xml).concat("</classVarDec>");
    };
    CompilationEngine.prototype.compileSubroutine = function (xml) {
        xml = xml.concat("<subroutineDec>");
        xml = xml.concat(this.xmlWriter.getKeyword());
        this.tokenizer.advance();
        xml = xml.concat(this.xmlWriter.getKeyword());
        this.tokenizer.advance();
        xml = xml.concat(this.xmlWriter.getIdentifier());
        this.tokenizer.advance();
        xml = xml.concat(this.xmlWriter.getSymbol());
        xml = this.compileParameterList(xml.concat("<parameterList>"));
        xml = xml.concat("</parameterList>");
        xml = xml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();
        xml = this.compileSubroutineBody(xml.concat("<subroutineBody>"));
        return xml.concat("</subroutineBody>").concat("</subroutineDec>");
    };
    CompilationEngine.prototype.compileParameterList = function (xml) {
        this.tokenizer.advance();
        var tokenState = this.tokenizer.getCurrentTokenState();
        if (tokenState.isSymbol && tokenState.value === Symbol_1.default.ParenLeft) {
            return xml;
        }
        if (tokenState.isKeyword) {
            return this.compileParameterList(xml.concat(this.xmlWriter.getKeyword()));
        }
        if (tokenState.isIdentifier) {
            return this.compileParameterList(xml.concat(this.xmlWriter.getIdentifier()));
        }
        if (tokenState.isSymbol && tokenState.value === Symbol_1.default.Comma) {
            return this.compileParameterList(xml.concat(this.xmlWriter.getSymbol()));
        }
        throw new Error("Failed to compile parameter list");
    };
    CompilationEngine.prototype.compileSubroutineBody = function (xml) {
        var nextXml;
        var tokenState = this.tokenizer.getCurrentTokenState();
        if (tokenState.isSymbol && tokenState.value === Symbol_1.default.CurlyLeft) {
            return xml.concat(this.xmlWriter.getSymbol());
        }
        if (tokenState.isSymbol && tokenState.value === Symbol_1.default.CurlyRight) {
            nextXml = xml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();
            return this.compileSubroutineBody(nextXml);
        }
        if (tokenState.isKeyword && tokenState.value === Keyword_1.default.Var) {
            var keywordXml = this.xmlWriter.getKeyword();
            var xmlToPass = xml.concat("<varDec>").concat(keywordXml);
            nextXml = this.compileVarDec(xmlToPass).concat("</varDec>");
            this.tokenizer.advance();
            return this.compileSubroutineBody(nextXml);
        }
        nextXml = xml.concat("<statements>");
        return this.compileSubroutineBody(this.compileStatements(nextXml).concat("</statements>"));
    };
    CompilationEngine.prototype.compileVarDec = function (xml) {
        this.tokenizer.advance();
        var tokenState = this.tokenizer.getCurrentTokenState();
        if (SymbolTable_1.default.isSemi(tokenState.value)) {
            return xml.concat(this.xmlWriter.getSymbol());
        }
        if (tokenState.isKeyword) {
            return this.compileVarDec(xml.concat(this.xmlWriter.getKeyword()));
        }
        if (tokenState.isSymbol && tokenState.value === Symbol_1.default.Comma) {
            return this.compileVarDec(xml.concat(this.xmlWriter.getSymbol()));
        }
        return this.compileVarDec(xml.concat(this.xmlWriter.getIdentifier()));
    };
    CompilationEngine.prototype.compileStatements = function (xml) {
        var nextXml;
        var currentToken = this.tokenizer.getCurrentToken();
        switch (currentToken) {
            case Keyword_1.default.Do:
                nextXml = this.compileDo(xml);
                break;
            case Keyword_1.default.Let:
                nextXml = this.compileLet(xml);
                break;
            case Keyword_1.default.While:
                nextXml = this.compileWhile(xml);
                break;
            case Keyword_1.default.Return:
                nextXml = this.compileReturn(xml);
                break;
            case Keyword_1.default.If:
                nextXml = this.compileIf(xml);
                break;
            default:
                throw new Error("Failed to identify keyword: " + currentToken);
        }
        if (this.tokenizer.getCurrentToken() === Symbol_1.default.CurlyLeft) {
            return nextXml;
        }
        return this.compileStatements(nextXml);
    };
    CompilationEngine.prototype.compileDo = function (xml) {
        var nextXml = xml.concat("<doStatement>");
        nextXml = nextXml.concat(this.xmlWriter.getKeyword());
        this.tokenizer.advance();
        nextXml = nextXml.concat(this.compileSubroutineCall(nextXml));
        nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();
        return nextXml.concat("</doStatement>");
    };
    CompilationEngine.prototype.compileLet = function (xml) {
        var nextXml = xml.concat("<letStatement>");
        nextXml = nextXml.concat(this.xmlWriter.getKeyword());
        this.tokenizer.advance();
        nextXml = nextXml.concat(this.xmlWriter.getIdentifier());
        this.tokenizer.advance();
        var tokenState = this.tokenizer.getCurrentTokenState();
        if (tokenState.isSymbol && tokenState.value === Symbol_1.default.Equals) {
            nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        }
        else if (tokenState.value === Symbol_1.default.BracketRight) {
            nextXml = nextXml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();
            nextXml = nextXml.concat("<expression>");
            nextXml = this.compileExpression(nextXml, Symbol_1.default.BracketLeft);
            nextXml = nextXml.concat("</expression>");
            nextXml = nextXml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();
            nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        }
        this.tokenizer.advance();
        nextXml = nextXml.concat("<expression>");
        nextXml = this.compileExpression(nextXml, Symbol_1.default.Semi);
        nextXml = nextXml.concat("</expression>");
        nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();
        return nextXml.concat("</letStatement>");
    };
    CompilationEngine.prototype.compileWhile = function (xml) {
        var nextXml = xml.concat("<whileStatement>");
        nextXml = nextXml.concat(this.xmlWriter.getKeyword());
        this.tokenizer.advance();
        nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();
        nextXml = nextXml.concat("<expression>");
        nextXml = this.compileExpression(nextXml, Symbol_1.default.ParenLeft);
        nextXml = nextXml.concat("</expression>");
        nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();
        nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();
        nextXml = nextXml.concat("<statements>");
        nextXml = this.compileStatements(nextXml);
        nextXml = nextXml.concat("</statements>");
        nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();
        return nextXml.concat("</whileStatement>");
    };
    CompilationEngine.prototype.compileReturn = function (xml) {
        var nextXml = xml.concat("<returnStatement>");
        nextXml = nextXml.concat(this.xmlWriter.getKeyword());
        this.tokenizer.advance();
        if (this.tokenizer.getCurrentToken() === Symbol_1.default.Semi) {
            nextXml = nextXml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();
            return nextXml.concat("</returnStatement>");
        }
        nextXml = nextXml.concat("<expression>");
        nextXml = this.compileExpression(nextXml, Symbol_1.default.Semi);
        nextXml = nextXml.concat("</expression>");
        nextXml = nextXml.concat(this.tokenizer.getSymbol());
        this.tokenizer.advance();
        return nextXml.concat("</returnStatement>");
    };
    CompilationEngine.prototype.compileIf = function (xml) {
        var nextXml = xml.concat("<ifStatement>");
        nextXml = this.compileConditional(nextXml);
        if (this.tokenizer.getCurrentToken() === Keyword_1.default.Else) {
            nextXml = this.compileConditional(nextXml);
        }
        return nextXml.concat("</ifStatement>");
    };
    CompilationEngine.prototype.compileConditional = function (xml) {
        var nextXml;
        nextXml = xml.concat(this.xmlWriter.getKeyword());
        this.tokenizer.advance();
        if (this.tokenizer.getCurrentToken() === Symbol_1.default.ParenRight) {
            nextXml = nextXml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();
            nextXml = nextXml.concat("<expression>");
            nextXml = this.compileExpression(nextXml, Symbol_1.default.ParenLeft);
            nextXml = nextXml.concat("</expression>");
            nextXml = nextXml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();
        }
        nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();
        nextXml = nextXml.concat("<statements>");
        nextXml = this.compileStatements(nextXml);
        nextXml = nextXml.concat("</statements>");
        nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();
        return nextXml;
    };
    CompilationEngine.prototype.compileExpression = function (xml, stopAtToken) {
        var currentToken = this.tokenizer.getCurrentToken();
        if (currentToken === stopAtToken) {
            return xml;
        }
        if (SymbolTable_1.default.isOp(currentToken)) {
            var nextXml_1 = xml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();
            return this.compileExpression(nextXml_1, stopAtToken);
        }
        var xmlToPass = xml.concat("<term>");
        var nextXml = this.compileTerm(xmlToPass).concat("</term>");
        currentToken = this.tokenizer.getCurrentToken();
        if (currentToken === stopAtToken) {
            return nextXml;
        }
        return this.compileExpression(nextXml, stopAtToken);
    };
    CompilationEngine.prototype.compileTerm = function (xml) {
        var tokenState = this.tokenizer.getCurrentTokenState();
        var lookAhead = this.tokenizer.lookAhead();
        if (tokenState.isIdentifier && lookAhead === Symbol_1.default.Period) {
            return this.compileSubroutineCall(xml);
        }
        if (tokenState.isIdentifier && lookAhead === Symbol_1.default.BracketRight) {
            var nextXml = xml.concat(this.xmlWriter.getIdentifier());
            this.tokenizer.advance();
            nextXml = nextXml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();
            nextXml = nextXml.concat("<expression>");
            nextXml = this.compileExpression(nextXml, Symbol_1.default.BracketLeft);
            nextXml = nextXml.concat("</expression>");
            nextXml = nextXml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();
            return nextXml;
        }
        if (SymbolTable_1.default.isUnaryOp(tokenState.value)) {
            var nextXml = xml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();
            nextXml = nextXml.concat("<term>");
            nextXml = this.compileTerm(nextXml);
            return nextXml.concat("</term>");
        }
        if (tokenState.value === Symbol_1.default.ParenRight) {
            var nextXml = xml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();
            nextXml = nextXml.concat("<expression>");
            nextXml = this.compileExpression(nextXml, Symbol_1.default.ParenLeft);
            nextXml = nextXml.concat("</expression>");
            nextXml = nextXml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();
            return nextXml;
        }
        if (tokenState.isIntConst) {
            var nextXml = xml.concat(this.xmlWriter.getIntConst());
            this.tokenizer.advance();
            return nextXml;
        }
        if (tokenState.isStringConst) {
            var nextXml = xml.concat(this.xmlWriter.getStringConst());
            this.tokenizer.advance();
            return nextXml;
        }
        if (tokenState.isKeyword) {
            var nextXml = xml.concat(this.xmlWriter.getKeyword());
            this.tokenizer.advance();
            return nextXml;
        }
        if (tokenState.isIdentifier) {
            var nextXml = xml.concat(this.xmlWriter.getIdentifier());
            this.tokenizer.advance();
            return nextXml;
        }
        throw new Error("Failed to identify <term> for " + tokenState.value);
    };
    CompilationEngine.prototype.compileSubroutineCall = function (xml) {
        var nextXml = xml.concat(this.xmlWriter.getIdentifier());
        this.tokenizer.advance();
        nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();
        nextXml = nextXml.concat(this.xmlWriter.getIdentifier());
        this.tokenizer.advance();
        nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();
        nextXml = nextXml.concat("<expressionList>");
        nextXml = this.compileExpressionList(nextXml);
        nextXml = nextXml.concat("</expressionList>");
        nextXml = nextXml.concat(this.xmlWriter.getSymbol());
        this.tokenizer.advance();
        return nextXml;
    };
    CompilationEngine.prototype.compileExpressionList = function (xml) {
        var tokenState = this.tokenizer.getCurrentTokenState();
        if (tokenState.value === Symbol_1.default.ParenLeft) {
            return xml;
        }
        if (tokenState.value === Symbol_1.default.Comma) {
            var nextXml_2 = xml.concat(this.xmlWriter.getSymbol());
            this.tokenizer.advance();
            return this.compileExpressionList(nextXml_2);
        }
        var nextXml = xml.concat("<expression>");
        nextXml = this.compileExpression(nextXml, Symbol_1.default.ParenLeft);
        return this.compileExpressionList(nextXml.concat("</expression>"));
    };
    return CompilationEngine;
}());
exports.default = CompilationEngine;
//# sourceMappingURL=index.js.map