import {
    RecognitionException,
    DefaultErrorStrategy,
    Parser,
    InputMismatchException,
    BailErrorStrategy,
    NoViableAltException} from "antlr4ts";

export class BellaErrorStrategy extends BailErrorStrategy {

    // https://stackoverflow.com/questions/18132078/handling-errors-in-antlr4
    // @Override
    recover(recognizer: Parser, e: RecognitionException){
        throw e;
    }

    reportNoViableAlternative(recognizer: Parser, e: NoViableAltException){
        throw e;
    }
    // @Override
    reportInputMismatch(recognizer: Parser, e: InputMismatchException){
        throw e;
    }

    reportUnwantedToken(recognizer: Parser) {
    }

    reportMissingToken(recognizer: Parser): void {
    }
}
