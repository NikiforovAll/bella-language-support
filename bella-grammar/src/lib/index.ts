import { ANTLRInputStream, CommonTokenStream, Token, Lexer, Parser } from 'antlr4ts';
import * as bellaGeneratedLexer from '../grammars/.antlr4/BellaLexer'
import { CompilationUnitContext, BellaParser} from '../grammars/.antlr4/BellaParser';
import { BellaDeclarationVisitor } from "./BellaVisitor";
// export class CalculationResult {
//     isValid: boolean;
//     errorPosition: null;
//     errorMessage: null;
//     result: number;

//     constructor() {
//         this.isValid = false;
//         this.errorPosition = null;
//         this.errorMessage = null;
//         this.result = NaN;
//     }
// }

export class BellaLanguageSupport {
    public static process(expr: string): Token[]{
        return this.generateLexer(expr)
            .getAllTokens();
    }

    public static generateLexer(expr: string): Lexer{
        let inputStream = new ANTLRInputStream(expr);
        let lexer = new bellaGeneratedLexer.BellaLexer (inputStream);
        return lexer;
    }

    public static generateTree(expr: string): CompilationUnitContext  {
        let lexer = this.generateLexer(expr);
        var commonTokenStream = new CommonTokenStream(lexer);
        var parser = new BellaParser(commonTokenStream);
        return parser.compilationUnit();
    }

    public static generateVisitor(): BellaDeclarationVisitor {
        return new BellaDeclarationVisitor();
    }
}
