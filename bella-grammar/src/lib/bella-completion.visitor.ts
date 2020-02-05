import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor';

import { BellaVisitor } from '../grammars/.antlr4/BellaVisitor';
import { BellaCompletionTrigger } from './models/bella-completion';
import { CallStatementContext } from '../grammars/.antlr4/BellaParser';
import { DeclarationType } from './models/declaration-type.enum';
import { BellaVisitorUtils } from './visitor.utils';



//TODO: change this
export class BellaCompletionVisitor extends AbstractParseTreeVisitor<any> implements BellaVisitor<BellaCompletionTrigger[]> {

    public triggers: BellaCompletionTrigger[] = [];

    protected defaultResult() {
        return [];
    }

    visitCallStatement(context: CallStatementContext): BellaCompletionTrigger[] {
        const startLine = context.start.line - 1;
        const procedureSignature = context.explicitGenericInvocation();
        const startOfParamsList = procedureSignature.arguments();
        const endLine =  (startOfParamsList.start?.line || context.start.line) - 1;
        let trigger: BellaCompletionTrigger = {
            completionBase: { context: procedureSignature.text }, expectedCompletions: [DeclarationType.Procedure],
            range: BellaVisitorUtils.createRange(
                startLine, procedureSignature.start.charPositionInLine,
                endLine, startOfParamsList.start.charPositionInLine
            )
        };
        let completion: BellaCompletionTrigger = {
            completionBase: { context: procedureSignature.text }, expectedCompletions: [DeclarationType.Object],
            range: BellaVisitorUtils.createRange(
                startOfParamsList.start.line - 1, startOfParamsList.start.charPositionInLine,
                (startOfParamsList.stop?.line || startOfParamsList.start.line) - 1, startOfParamsList.stop?.charPositionInLine)
        }
        return this.accumulateResult([trigger, completion]);
    }

    private accumulateResult(triggers: BellaCompletionTrigger[]) {
        this.triggers.push(...triggers);
        return triggers;
    }

}
