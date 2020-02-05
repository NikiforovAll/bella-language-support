import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor';

import { BellaVisitor } from '../grammars/.antlr4/BellaVisitor';
import { BellaCompletionTrigger } from './models/bella-completion';
import { CallStatementContext } from '../grammars/.antlr4/BellaParser';
import { DeclarationType } from './models/declaration-type.enum';
import { BellaVisitorUtils } from './visitor.utils';



//TODO: change this
export class CompletionVisitor extends AbstractParseTreeVisitor<any> implements BellaVisitor<BellaCompletionTrigger[]> {

    public triggers: BellaCompletionTrigger[] = [];

    protected defaultResult() {
        return [];
    }

    visitCallStatement(context: CallStatementContext): BellaCompletionTrigger[] {
        const startLine = context.start.line - 1;
        const stopContext = context.explicitGenericInvocation();
        const endLine =  (stopContext.start?.line || context.start.line) - 1;
        let trigger: BellaCompletionTrigger = {
            completionBase: { context: '' }, expectedCompletions: [DeclarationType.Procedure],
            range: BellaVisitorUtils.createRange(
                startLine, context.start.charPositionInLine,
                endLine, stopContext.start?.charPositionInLine
            )
        };
        return this.accumulateResult([trigger]);
    }

    private accumulateResult(triggers: BellaCompletionTrigger[]) {
        this.triggers.push(...triggers);
        return triggers;
    }

}
