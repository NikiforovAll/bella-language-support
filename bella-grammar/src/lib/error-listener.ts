import { RecognitionException, DiagnosticErrorListener, Recognizer, CommonToken, Parser } from "antlr4ts";
import { SimulatorState } from "antlr4ts/atn/SimulatorState";
import { DFA } from "antlr4ts/dfa/DFA";

export class ThrowingErrorListener extends DiagnosticErrorListener {
    public static INSTANCE: ThrowingErrorListener = new ThrowingErrorListener();


    //TODO: check impl https://github.com/GeorgDangl/antlr-calculator/blob/master/Calculator.ts
    // https://www.antlr.org/api/Java/org/antlr/v4/runtime/ANTLRErrorListener.html
    syntaxError(
        recognizer: any,
        offendingSymbol: any,
        line: number,
        charPositionInLine: number,
        msg: string,
        e: RecognitionException | undefined): void {
        const errorMessage = `line ${line}:${charPositionInLine} ${msg}`;
        let error = new BellaRecognitionException(errorMessage);
        error.diagnosticsContext = {
            offendingSymbol,
            e
        };
        //console.log('Error', errorMessage);
        let r = recognizer as Recognizer<CommonToken, any>
        throw error;

    }

    // This method is called by the parser when a full-context prediction has a unique result.
    reportContextSensitivity(recognizer: Parser, dfa: DFA, startIndex: number, stopIndex: number, prediction: number, acceptState: SimulatorState) {
        // engulf error related to full context sensitivity
        console.warn(`ContextSensitivity: ${startIndex}:${stopIndex}`);
    }
}

export class BellaRecognitionException extends Error{
    diagnosticsContext?: any
}
