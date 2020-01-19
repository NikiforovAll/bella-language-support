import {
    ANTLRErrorStrategy,
    ANTLRInputStream,
    CommonTokenStream,
    DiagnosticErrorListener,
    Lexer,
    ParserRuleContext,
    Token,
} from 'antlr4ts';

import * as bellaGeneratedLexer from '../grammars/.antlr4/BellaLexer';
import { BellaParser } from '../grammars/.antlr4/BellaParser';
import { BellaDeclarationVisitor } from './bella-declaration.visitor';
import { BellaErrorStrategy } from './bella-error-strategy';
import { BellaReferenceVisitor } from './bella-reference.visitor';

export {
    BaseDeclaration,
    Position,
    Range
} from './models/base-declaration';

export { MemberComposite } from './models/base-declaration';
export { ObjectBase } from './models/object-base.enum';
export { DeclarationType } from './models/declaration-type.enum';

export {
    SimpleObjectDeclaration,
    CompositeObjectDeclaration
} from './models/object-declaration';

export { ServiceDeclaration } from './models/service-declaration';
export { ProcedureDeclaration } from './models/procedure-declaration';
export { FormulaDeclaration } from './models/formula-declaration';
export { ThrowingErrorListener } from './error-listener';
export { BellaErrorStrategy } from './bella-error-strategy';

export { BellaReference, BellaReferenceType } from './models/bella-reference';
export { BellaNestedReference } from './models/bella-nested-reference';

export class BellaLanguageSupport {
    public static tokenize(expr: string): Token[] {
        return this.generateLexer(expr)
            .getAllTokens();
    }

    public static generateLexer(expr: string): Lexer {
        let inputStream = new ANTLRInputStream(expr);
        let lexer = new bellaGeneratedLexer.BellaLexer(inputStream);
        return lexer;
    }

    public static parse(expr: string): ParserRuleContext {
        let parser = BellaLanguageSupport.generateParser(expr);
        return parser.compilationUnit();
    }

    public static parseWithErrorListener(
        expr: string,
        listener: DiagnosticErrorListener) {
        let parser = BellaLanguageSupport.generateParser(expr);
        // https://stackoverflow.com/questions/18132078/handling-errors-in-antlr4/18137301#18137301
        // https://stackoverflow.com/questions/18484869/how-to-collect-errors-during-run-time-given-by-a-parser-in-antlr4
        parser.removeErrorListeners();
        parser.addErrorListener(listener);
        return parser.compilationUnit();
    }

    public static parseWithErrorStrategy(expr: string, strategy: ANTLRErrorStrategy) {
        let parser = BellaLanguageSupport.generateParser(expr);
        parser.errorHandler = new BellaErrorStrategy();
        // parser.errorHandler = new BailErrorStrategy();
        let ctx = parser.compilationUnit();
        return ctx;
    }

    public static generateVisitor(type: VisitorType = VisitorType.DeclarationVisitor) {
        switch (type) {
            case VisitorType.DeclarationVisitor:
                return new BellaDeclarationVisitor();
            case VisitorType.ReferencesVisitor:
                return new BellaReferenceVisitor();
            default:
                throw Error('Can\'t create visitor: unknown type');
        }
    }

    public static generateParser(input: string): BellaParser {
        let lexer = this.generateLexer(input);
        // let names = lexer.getAllTokens().filter(t => t.type === BellaParser.Identifier);
        var commonTokenStream = new CommonTokenStream(lexer);
        var parser = new BellaParser(commonTokenStream);
        return parser;
    }
}

export enum VisitorType {
    DeclarationVisitor,
    ReferencesVisitor
}
