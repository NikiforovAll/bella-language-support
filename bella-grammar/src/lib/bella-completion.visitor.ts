import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor';

import {
    CallStatementContext,
    ExpressionContext,
    GeneralSignatureContext,
    GenericInvocationContext,
    InvocationExpressionContext,
    LocalVariableDeclarationStatementContext,
    NewStatementContext,
    BellaParser,
    ExpressionListContext,
} from '../grammars/.antlr4/BellaParser';
import { BellaVisitor } from '../grammars/.antlr4/BellaVisitor';
import { BellaCompletionTrigger, CompletionScope } from './models/bella-completion';
import { DeclarationType } from './models/declaration-type.enum';
import { BellaVisitorUtils } from './visitor.utils';

const DECLARATION_LEVEL_SCOPE = [
    DeclarationType.Object,
    DeclarationType.Enum,
    DeclarationType.Type
]

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
        const paramsListContext = procedureSignature.arguments();
        const endLine = (paramsListContext.start?.line || context.start.line) - 1;
        //procedure name
        let trigger: BellaCompletionTrigger = {
            completionBase: { context: procedureSignature.text },
            expectedCompletions: [
                DeclarationType.Procedure
            ],
            range: BellaVisitorUtils.createRange(
                startLine, procedureSignature.start.charPositionInLine,
                endLine, paramsListContext.start.charPositionInLine
            ),
            scope: CompletionScope.Block
        };
        let signatureSupport: BellaCompletionTrigger = {
            completionBase: {
                //truncated signature, important!!!
                context: procedureSignature.text,
                completionSource: [
                    { name: '', type: DeclarationType.Procedure }
                ]
            },
            expectedCompletions: [
                // TODO: this should be just global scope but signature completion at the same time
                // DeclarationType.Object,
                // DeclarationType.PersistentObject
            ],
            range: BellaVisitorUtils.createRange(
                paramsListContext.start.line - 1, paramsListContext.start.charPositionInLine,
                (paramsListContext.stop?.line || paramsListContext.start.line) - 1, paramsListContext.stop?.charPositionInLine),
            scope: CompletionScope.Ambient
        }
        //TODO: this is not complete!!!
        let innerTriggers = paramsListContext
            ?.expressionList()
            ?.expression()
            ?.map(expression => this.visitExpressionLocal(expression))
            .reduce((acc, t) => acc.concat(t))
            .filter(t => !!t) || [];

        return this.accumulateResult([trigger, signatureSupport, ...innerTriggers]);
    }

    /**
     * new (expression)
     * @param context
     */
    visitNewStatement(context: NewStatementContext): BellaCompletionTrigger[] {
        const expressionMain = context.expression();
        let membersContext = expressionMain.expressionList();
        const identifierContext = expressionMain.Identifier();
        const lParen = expressionMain.LPAREN();
        let result: BellaCompletionTrigger[] = [];
        if (!!identifierContext && !!lParen) {
            let completions: BellaCompletionTrigger[] = membersContext?.expression().map(expr => {
                let startLine = expr.start.line;
                let endLine = expr.stop?.line || startLine;
                let startPosition = expr.start.charPositionInLine;
                // let endPosition = expr.stop?.charPositionInLine || startPosition + expr.start.charPositionInLine;
                let endOfExpressionPosition = expr.stop?.charPositionInLine;
                if (endOfExpressionPosition === expr.start.charPositionInLine) {
                    // potentially error prone
                    endOfExpressionPosition = expr.start.charPositionInLine + expr.text.length
                }
                let endPosition = expr.ASSIGN()?.symbol.charPositionInLine
                    || endOfExpressionPosition;
                startLine--;
                endLine--;

                let completion: BellaCompletionTrigger = {
                    completionBase: {
                        context: context.text,
                        completionSource: [
                            {
                                name: identifierContext.text,
                                // type: DeclarationType.Object
                            }
                        ]
                    },
                    expectedCompletions: [
                        DeclarationType.ObjectField,
                    ],
                    range: BellaVisitorUtils.createRange(startLine, startPosition, endLine, endPosition),
                    scope: CompletionScope.Block
                }
                return completion;
            }).filter(t => !!t) || [];

            const isTrailingCommaMemberContext = (ctx: ExpressionListContext) => {
                const lastExpressionStart = ctx.expression()?.pop()?.start?.charPositionInLine || -1;
                const lastCommaStart = ctx.getTokens(BellaParser.COMMA).pop()?.symbol.charPositionInLine || -1;
                return lastExpressionStart < lastCommaStart;
                // return (ctx.getTokens(BellaParser.COMMA).length || 0) >= (ctx.expression().length || 0)
            }

            if (completions.length === 0) {
                let completion: BellaCompletionTrigger = {
                    completionBase: {
                        context: context.text,
                        completionSource: [
                            {
                                name: identifierContext.text,
                                // type: DeclarationType.Object
                            }
                        ]
                    },
                    expectedCompletions: [
                        DeclarationType.ObjectField,
                    ],
                    range: BellaVisitorUtils.createRange(
                        lParen.symbol.line - 1,
                        lParen.symbol.charPositionInLine,
                        (expressionMain.RPAREN()?.symbol.line || lParen.symbol.line) - 1,
                        expressionMain.RPAREN()?.symbol.charPositionInLine),
                    scope: CompletionScope.Block
                }
                completions.push(completion);
            } else if (!!membersContext && isTrailingCommaMemberContext(membersContext)) {
                let trailingCommaContext = membersContext?.getTokens(BellaParser.COMMA)?.pop();
                if (trailingCommaContext) {
                    let completion: BellaCompletionTrigger = {
                        completionBase: {
                            context: context.text,
                            completionSource: [
                                {
                                    name: identifierContext.text,
                                    // type: DeclarationType.Object
                                }
                            ]
                        },
                        expectedCompletions: [
                            DeclarationType.ObjectField,
                        ],
                        range: BellaVisitorUtils.createRange(
                            trailingCommaContext.symbol.line - 1,
                            trailingCommaContext.symbol.charPositionInLine,
                            (expressionMain.RPAREN()?.symbol.line || lParen.symbol.line) - 1,
                            expressionMain.RPAREN()?.symbol.charPositionInLine),
                        scope: CompletionScope.Block
                    }
                    completions.push(completion);
                }
            }
            result.push(...completions);
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
        const triggerIdentifier = procedureSignature.Identifier()?.text || '';
        let trigger: BellaCompletionTrigger = {
            completionBase: {
                context: procedureSignature.text,
                completionSource: [{
                    name: triggerIdentifier,
                    // type: DeclarationType.ServiceEntry
                },
                // TODO: consider adding this
                // {
                //     name: triggerIdentifier,
                //     type: DeclarationType.Formula
                // }
            ]
            },
            expectedCompletions: [DeclarationType.ServiceEntry],
            range: BellaVisitorUtils.createRange(
                startLine, procedureSignature.start.charPositionInLine,
                endLine, startOfParamsList.start.charPositionInLine
            ),
            scope: CompletionScope.Block
        };
        let triggerName = '';
        try {
            //TODO: fix it, dirty approach
            const ctx = procedureSignature as any;
            triggerName = ctx.parent.parent.type().Identifier().text;
        } catch (error) {

        }
        let signatureSupport: BellaCompletionTrigger = {
            completionBase: {
                //truncated signature, important!!!
                context: procedureSignature.text,
                completionSource: [
                    {
                        name: triggerName,
                        type: DeclarationType.ServiceEntry
                    },
                    {
                        name: triggerName,
                        type: DeclarationType.Formula
                    }
                ]
            },
            expectedCompletions: [
                // TODO: this should be just global scope
                // DeclarationType.Object,
                // DeclarationType.PersistentObject
            ],
            range: BellaVisitorUtils.createRange(
                startOfParamsList.start.line - 1, startOfParamsList.start.charPositionInLine,
                (startOfParamsList.stop?.line || startOfParamsList.start.line) - 1, startOfParamsList.stop?.charPositionInLine),
            scope: CompletionScope.Ambient
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
        return this.accumulateResult(result);
    }

    visitExpressionLocal(context: ExpressionContext): BellaCompletionTrigger[] {
        const dotContext = context.DOT();
        if (!dotContext) {
            // throw new Error('DOT is expected in parent expression');
            return [];
        }
        const identifierContext = context.expression()[0].Identifier();
        const result: BellaCompletionTrigger[] = [];
        let stopCharacterPosition = dotContext.symbol.charPositionInLine + 1;
        const invocationExpressionContextStop = context.invocationExpression()
            ?.Identifier()
            ?.symbol;
        if (!!invocationExpressionContextStop) {
            stopCharacterPosition = invocationExpressionContextStop.charPositionInLine + (invocationExpressionContextStop.text?.length || 0);
        }
        const range = BellaVisitorUtils.createRange(
            dotContext.symbol.line - 1,
            dotContext.symbol.charPositionInLine + 1,
            // (context.stop?.line || context.start.line) - 1,
            (context.stop?.line || dotContext.symbol.line) - 1,
            stopCharacterPosition
        );
        const expectedCompletions = [
            DeclarationType.ServiceEntry,
            DeclarationType.ObjectField,
            DeclarationType.EnumEntry,
            DeclarationType.Formula,
            DeclarationType.Type
        ];
        if (!!identifierContext) {
            let completionTrigger: BellaCompletionTrigger = {
                completionBase: {
                    context: context.text,
                    completionSource: [
                        { name: identifierContext.text },
                        // { name: identifierContext.text, type: DeclarationType.Service },
                        // { name: identifierContext.text, type: DeclarationType.Object },
                        // { name: identifierContext.text, type: DeclarationType.Enum },
                    ]
                }, expectedCompletions, range,
                scope: CompletionScope.Block
            }
            result.push(completionTrigger)
        } else {
            let compoundCompletionTrigger: BellaCompletionTrigger = {
                completionBase: {
                    context: context.text,
                    compoundCompletionSource: this.visitExpressionLocal(context.expression()[0])
                }, expectedCompletions, range,
                scope: CompletionScope.Block
            }
            result.push(compoundCompletionTrigger)
        }
        return result;
    }

    /**
     * let Identifier = expression (also newStatement goes here)
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
                ),
                scope: CompletionScope.Block
            }
            result.push(completion);
        }
        const newStatementContext = context.localVariableDeclaration().newStatement();
        if (!!newStatementContext) {
            this.visitNewStatement(newStatementContext);
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
            completionBase: {
                context: context.text,
                // completionSource: [{name: ''}]
            },
            expectedCompletions: DECLARATION_LEVEL_SCOPE,
            range: BellaVisitorUtils.createRange(
                startLine,
                lParenContext.symbol.charPositionInLine,
                endLine,
                rParenContext.symbol.charPositionInLine
            ),
            scope: CompletionScope.Block
        }
        result.push(completion);
        return this.accumulateResult(result);
    }


    private accumulateResult(triggers: BellaCompletionTrigger[]) {
        this.triggers.push(...triggers);
        return triggers;
    }

}
