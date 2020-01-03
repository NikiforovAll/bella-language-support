import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
var bellaGeneratedLexer = require('../../grammars/.antlr4/BellaLexer');

export class CalculationResult {
    isValid: boolean;
    errorPosition: null;
    errorMessage: null;
    result: number;

    constructor() {
        this.isValid = false;
        this.errorPosition = null;
        this.errorMessage = null;
        this.result = NaN;
    }
}

export class BellaLexer {
    public static Process(expr: string){
        // Create the lexer and parser
        let inputStream = new ANTLRInputStream("1+1");
        let lexer = new bellaGeneratedLexer(inputStream);
        let tokenStream = new CommonTokenStream(lexer);
    }
}
