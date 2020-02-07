import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor';

import { BellaVisitor } from '../grammars/.antlr4/BellaVisitor';
import { BellaCompletionTrigger } from './models/bella-completion';
import { CallStatementContext, NewStatementContext, LocalVariableDeclarationContext, ExpressionContext, LocalVariableDeclarationStatementContext, BellaParser, ProcedureParamContext, GeneralSignatureContext } from '../grammars/.antlr4/BellaParser';
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
        const endLine = (startOfParamsList.start?.line || context.start.line) - 1;
        let trigger: BellaCompletionTrigger = {
            completionBase: { context: procedureSignature.text }, expectedCompletions: [DeclarationType.Procedure],
            range: BellaVisitorUtils.createRange(
                startLine, procedureSignature.start.charPositionInLine,
                endLine, startOfParamsList.start.charPositionInLine
            )
        };
        let completion: BellaCompletionTrigger = {
            completionBase: { context: procedureSignature.text },
            expectedCompletions: [DeclarationType.Object, DeclarationType.PersistentObject],
            range: BellaVisitorUtils.createRange(
                startOfParamsList.start.line - 1, startOfParamsList.start.charPositionInLine,
                (startOfParamsList.stop?.line || startOfParamsList.start.line) - 1, startOfParamsList.stop?.charPositionInLine)
        }
        return this.accumulateResult([trigger, completion]);
    }

    visitNewStatement(context: NewStatementContext): BellaCompletionTrigger[] {
        const expression = context.expression();
        let membersContext = expression.expressionList();
        let identifierContext = expression.expression()[0].Identifier();
        let lParen = expression.LPAREN();
        let result: BellaCompletionTrigger[] = [];
        if(!!identifierContext && !!lParen) {
            let completion: BellaCompletionTrigger = {
                completionBase: {
                    context: context.text,
                    completionSource: [
                        {name: identifierContext.text, type: DeclarationType.Object}
                    ]
                },
                expectedCompletions: [
                    DeclarationType.Object,
                    DeclarationType.ObjectField,
                    DeclarationType.PersistentObject
                ],
                range: BellaVisitorUtils.createRange(
                    lParen.symbol.line - 1,
                    lParen.symbol.charPositionInLine,
                    (expression.RPAREN()?.symbol.line || lParen.symbol.line) - 1,
                    expression.RPAREN()?.symbol.charPositionInLine)
            }
            result.push(completion);
        }
        return this.accumulateResult(result);
    }

    // visitExpression(context: ExpressionContext): BellaCompletionTrigger[] {
    //     const startLine = context.start.line - 1;
    //     const endLine = (context.stop?.line || context.start.line) - 1;
    //     let completion: BellaCompletionTrigger = {
    //         completionBase: { context: context.text }, expectedCompletions: [DeclarationType.Object],
    //         range: BellaVisitorUtils.createRange(
    //             startLine,
    //             context.start.charPositionInLine,
    //             endLine,
    //             context.stop?.charPositionInLine
    //         )
    //     }
    //     return this.accumulateResult([completion]);
    // }

    visitLocalVariableDeclarationStatement(context: LocalVariableDeclarationStatementContext): BellaCompletionTrigger[] {
        const startLine = context.start.line - 1;
        const endLine = (context.stop?.line || context.start.line) - 1;
        let result: BellaCompletionTrigger[] = [];
        if (!!context.localVariableDeclaration().exception) {
            let completion: BellaCompletionTrigger = {
                completionBase: { context: context.text },
                expectedCompletions: [],
                range: BellaVisitorUtils.createRange(
                    startLine,
                    context.start.charPositionInLine,
                    endLine,
                )
            }
            result.push(completion);
        }

        if (context.localVariableDeclaration().expression().length > 0) {
            let membersContext = context.localVariableDeclaration().expression()[0];
            let leftParenContext = membersContext.LPAREN();
            //TODO: this is bug prone, may cause potential issues
            let sourceObject = membersContext.expression()[0].Identifier();
            if (!!leftParenContext && !!sourceObject) {
                let membersCompletion: BellaCompletionTrigger = {
                    completionBase: {
                        context: context.text,
                        completionSource: [
                            {
                                name: sourceObject.text,
                                type: DeclarationType.Object
                            }
                        ]
                    },
                    expectedCompletions: [
                        DeclarationType.ObjectField,
                        DeclarationType.PersistentObject,
                        DeclarationType.Object],
                    range: BellaVisitorUtils.createRange(
                        membersContext.start.line - 1,
                        leftParenContext.symbol.charPositionInLine,
                        endLine,
                        membersContext.RPAREN()?.symbol.charPositionInLine
                    )
                }
                result.push(membersCompletion)
            }
        }
        return this.accumulateResult(result);
    }

    visitGeneralSignature(context: GeneralSignatureContext): BellaCompletionTrigger[] {
        const lParenContext = context.LPAREN();
        const rParenContext = context.RPAREN();
        if(!lParenContext || !rParenContext) {
            return [];
        }
        const startLine = lParenContext.symbol.line - 1;
        const endLine = rParenContext.symbol.line - 1;
        let result: BellaCompletionTrigger[] = [];
        let completion: BellaCompletionTrigger = {
            completionBase: { context: context.text },
            expectedCompletions: [ DeclarationType.Object],
            range: BellaVisitorUtils.createRange(
                startLine,
                lParenContext.symbol.charPositionInLine,
                endLine,
                rParenContext.symbol.charPositionInLine
            )
        }
        result.push(completion);
        return this.accumulateResult(result);
    }


    private accumulateResult(triggers: BellaCompletionTrigger[]) {
        this.triggers.push(...triggers);
        return triggers;
    }

}
