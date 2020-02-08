import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor';

import { BellaVisitor } from '../grammars/.antlr4/BellaVisitor';
import { BellaCompletionTrigger } from './models/bella-completion';
import { CallStatementContext, NewStatementContext, LocalVariableDeclarationContext, ExpressionContext, LocalVariableDeclarationStatementContext, BellaParser, ProcedureParamContext, GeneralSignatureContext, InvocationStatementContext, ExplicitGenericInvocationContext, InvocationExpressionContext, GenericInvocationContext } from '../grammars/.antlr4/BellaParser';
import { DeclarationType } from './models/declaration-type.enum';
import { BellaVisitorUtils } from './visitor.utils';
import { ParserRuleContext } from 'antlr4ts';
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';



export class BellaCompletionVisitor extends AbstractParseTreeVisitor<any> implements BellaVisitor<BellaCompletionTrigger[]> {

    public triggers: BellaCompletionTrigger[] = [];

    protected defaultResult() {
        return [];
    }

    /**
     * call Identifier ( expressionList )
     * @param context
     */
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
        let signatureSupport: BellaCompletionTrigger = {
            completionBase: {
                //truncated signature, important!!!
                context: procedureSignature.text,
                completionSource: [
                    { name: '', type: DeclarationType.Procedure }
                ]
            },
            expectedCompletions: [DeclarationType.Object, DeclarationType.PersistentObject],
            range: BellaVisitorUtils.createRange(
                startOfParamsList.start.line - 1, startOfParamsList.start.charPositionInLine,
                (startOfParamsList.stop?.line || startOfParamsList.start.line) - 1, startOfParamsList.stop?.charPositionInLine)
        }
        return this.accumulateResult([trigger, signatureSupport]);
    }

    /**
     * new (expression)
     * @param context
     */
    visitNewStatement(context: NewStatementContext): BellaCompletionTrigger[] {
        const expression = context.expression();
        let membersContext = expression.expressionList();
        let identifierContext = expression.Identifier();
        let lParen = expression.LPAREN();
        let result: BellaCompletionTrigger[] = [];
        if (!!identifierContext && !!lParen) {
            let completion: BellaCompletionTrigger = {
                completionBase: {
                    context: context.text,
                    completionSource: [
                        { name: identifierContext.text, type: DeclarationType.Object }
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

    /**
     * type . arguments( expressionList )
     * @param context
     */
    //TODO: need to parse expression inside to get completions for
    visitGenericInvocation(context: GenericInvocationContext): BellaCompletionTrigger[] {
        const startLine = context.start.line - 1;
        const procedureSignature = context.explicitGenericInvocation();
        if (!procedureSignature) {
            return [];
        }
        const startOfParamsList = procedureSignature.arguments();
        const endLine = (startOfParamsList.start?.line || context.start.line) - 1;
        let trigger: BellaCompletionTrigger = {
            completionBase: {
                context: procedureSignature.text,
                completionSource: [{
                    name: procedureSignature.Identifier()?.text || '',
                    type: DeclarationType.ServiceEntry // TODO: could be formula
                }]
            },
            expectedCompletions: [DeclarationType.ServiceEntry],
            range: BellaVisitorUtils.createRange(
                startLine, procedureSignature.start.charPositionInLine,
                endLine, startOfParamsList.start.charPositionInLine
            )
        };
        let serviceName = '';
        try {
            //TODO: fix it, dirty approach
            const ctx = procedureSignature as any;
            serviceName = ctx.parent.parent.type().Identifier().text;
        } catch (error) {

        }
        let signatureSupport: BellaCompletionTrigger = {
            completionBase: {
                //truncated signature, important!!!
                context: procedureSignature.text,
                completionSource: [
                    {
                        name: serviceName,
                        type: DeclarationType.ServiceEntry
                    }
                ]
            },
            expectedCompletions: [DeclarationType.Object, DeclarationType.PersistentObject],
            range: BellaVisitorUtils.createRange(
                startOfParamsList.start.line - 1, startOfParamsList.start.charPositionInLine,
                (startOfParamsList.stop?.line || startOfParamsList.start.line) - 1, startOfParamsList.stop?.charPositionInLine)
        }
        return this.accumulateResult([trigger, signatureSupport]);
    }

    /**
     * expression DOT expression
     * @param context
     */
    visitInvocationExpression(context: InvocationExpressionContext): BellaCompletionTrigger[] {
        const expression = context.parent as ExpressionContext;
        if (!expression) {
            throw new Error('Invalid invocation expression');
        }
        this.visitExpressionLocal(expression);
        let result: BellaCompletionTrigger[] = this.visitExpressionLocal(expression);
        //END; STATUS: WORK IN PROGRESS
        // const possibleDotContext = expression.DOT();
        // const dotContext: TerminalNode = possibleDotContext;
        // const identifierContext = expression.expression()[0].Identifier();
        // if (!!identifierContext) {
        //     let completionTrigger: BellaCompletionTrigger = {
        //         completionBase: {
        //             context: context.text,
        //             completionSource: [
        //                 { name: identifierContext.text, type: DeclarationType.Service },
        //                 { name: identifierContext.text, type: DeclarationType.Object }
        //             ]
        //         },
        //         expectedCompletions: [
        //             DeclarationType.ServiceEntry,
        //             DeclarationType.ObjectField
        //         ],
        //         range: BellaVisitorUtils.createRange(
        //             dotContext.symbol.line - 1,
        //             dotContext.symbol.charPositionInLine,
        //             (context.stop?.line || context.start.line) - 1,
        //             dotContext.symbol.charPositionInLine + (context.Identifier()?.text?.length || 0) + 1
        //         )
        //     }
        //     result.push(completionTrigger);
        // }
        return this.accumulateResult(result);
    }

    visitExpressionLocal(context: ExpressionContext): BellaCompletionTrigger[] {
        const dotContext = context.DOT();
        const identifierContext = context.expression()[0].Identifier();
        const result: BellaCompletionTrigger[] = [];
        if (!!identifierContext && !!dotContext) {
            let completionTrigger: BellaCompletionTrigger = {
                completionBase: {
                    context: context.text,
                    completionSource: [
                        { name: identifierContext.text, type: DeclarationType.Service },
                        { name: identifierContext.text, type: DeclarationType.Object }
                    ]
                },
                expectedCompletions: [
                    DeclarationType.ServiceEntry,
                    DeclarationType.ObjectField
                ],
                range: BellaVisitorUtils.createRange(
                    dotContext.symbol.line - 1,
                    dotContext.symbol.charPositionInLine,
                    (context.stop?.line || context.start.line) - 1,
                    dotContext.symbol.charPositionInLine + (context.Identifier()?.text?.length || 0) + 1
                )
            }
            result.push(completionTrigger)
        } else {
            //TODO: compound completion base
        }
        return result;
    }

    /**
     * let Identifier = expression
     * @param context
     */
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
            let sourceObject = membersContext.Identifier();
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
        if (!lParenContext || !rParenContext) {
            return [];
        }
        const startLine = lParenContext.symbol.line - 1;
        const endLine = rParenContext.symbol.line - 1;
        let result: BellaCompletionTrigger[] = [];
        let completion: BellaCompletionTrigger = {
            completionBase: { context: context.text },
            expectedCompletions: [DeclarationType.Object],
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
