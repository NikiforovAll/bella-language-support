import { RecognitionException, DiagnosticErrorListener, Recognizer, CommonToken } from "antlr4ts";

export class ThrowingErrorListener extends DiagnosticErrorListener {
    public static INSTANCE: ThrowingErrorListener = new ThrowingErrorListener();


    //TODO: check impl https://github.com/GeorgDangl/antlr-calculator/blob/master/Calculator.ts
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
}

export class BellaRecognitionException extends Error{
    diagnosticsContext?: any
}
