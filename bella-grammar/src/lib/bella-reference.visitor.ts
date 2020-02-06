import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor';
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';

import {
    ArrayDeclarationContext,
    CallStatementContext,
    CollectionDeclarationContext,
    DictionaryDeclarationContext,
    ServiceDeclarationEntryContext,
    TypeContext,
    GeneralSignatureContext,
    FormulaSignatureContext,
    LocalVariableDeclarationContext,
    InvocationStatementContext,
    GenericInvocationContext,
    ServiceDeclarationContext,
    ServicePrefixContext,
    ProcedureDeclarationContext,
    ObjectExtensionContext,
    BellaParser
} from '../grammars/.antlr4/BellaParser';
import { BellaVisitor } from '../grammars/.antlr4/BellaVisitor';
import { BellaReference, BellaReferenceType, ReferenceIdentifier } from './models/bella-reference';
import { BellaAmbiguousReference } from "./models/bella-ambiguous-reference";
import { BellaNestedReference } from "./models/bella-nested-reference";
import { DeclarationType } from './models/declaration-type.enum';
import { BellaVisitorUtils } from './visitor.utils';
import { ParserRuleContext } from 'antlr4ts';



export class BellaReferenceVisitor extends AbstractParseTreeVisitor<any> implements BellaVisitor<BellaReference[]> {
    public references: BellaReference[] = [];
    protected defaultResult() {
        return [];
    }

    // visitServiceDeclaration(context: ServiceDeclarationContext): BellaReference[] {
    //     let result = this.visitIdentifierLocal(context.Identifier(), DeclarationType.Service, true);
    //     return this.accumulateResult(result);
    // }

    visitServicePrefix(context: ServicePrefixContext): BellaReference[] {
        let result = this.visitIdentifierLocal(context.Identifier(), DeclarationType.Service, true);
        return this.accumulateResult(result);
    }

    // currently, it is entry point for procedure signature parsing
    visitGeneralSignature(context: GeneralSignatureContext): BellaReference[] {
        let result = this.visitGeneralSignatureLocal(context, DeclarationType.Procedure);
        return this.accumulateResult(result);
    }

    visitFormulaSignature(context: FormulaSignatureContext): BellaReference[] {
        let returnTypeCtx = context.type();
        let result = this.visitGeneralSignatureLocal(context.generalSignature(), DeclarationType.Formula);
        if (returnTypeCtx) {
            result.push(...this.visitTypeLocal(returnTypeCtx));
        }
        return this.accumulateResult(result);
    }

    visitGeneralSignatureLocal(context: GeneralSignatureContext, nameOf: DeclarationType): BellaReference[] {
        let procedureParamCtx = context.procedureParamList();
        let result = [
            ...this.visitIdentifierLocal(context.Identifier(), nameOf, true)
        ];
        if (procedureParamCtx) {
            //TODO: fix this, it might contain bug if param return more than one declarations
            let params = procedureParamCtx.procedureParam()
                .map(pp => this.visitTypeLocal(pp.type())[0]).filter(i => i !== undefined);
            result.push(...params);
        }

        return result;
    }

    visitType(context: TypeContext): BellaReference[] {
        let result = this.visitTypeLocal(context);
        return this.accumulateResult(result);
    }

    visitCallStatement(context: CallStatementContext): BellaReference[] {
        let result = this.visitIdentifierLocal(context.explicitGenericInvocation().Identifier(), DeclarationType.Procedure);
        const params = context.explicitGenericInvocation()
            .arguments()
            .expressionList()
            ?.expression()
            .map(e => e.getTokens(BellaParser.Identifier))
            .reduce((acc, val) => acc.concat(val), [])
            .map(t => this.visitIdentifierLocal(t, DeclarationType.Object)[0]) || [];
        result.push(
            ...params
        );
        // result.forEach(r => { r.container = this.inferProcedureDeclaration(context); })
        return this.accumulateResult(result);
    }

    // TODO: this implementation doesn't not include formulas calculated on expressions TBD
    visitInvocationStatement(context: InvocationStatementContext): BellaReference[] {
        let typeContext = context.type();
        if (!typeContext) {
            return [];
        }
        const baseContainer = this.visitTypeLocal(typeContext)[0];
        baseContainer.referenceTo = DeclarationType.Service;
        let invocationExpression = this.visitGenericInvocationLocal(context.genericInvocation())[0];
        let container: BellaAmbiguousReference & BellaNestedReference = {
            ...baseContainer,
            possibleTypes: [
                {
                    referenceTo: DeclarationType.Object,
                    nameTo: baseContainer.nameTo
                }
            ],
            childTo: invocationExpression.nameTo,
            //TODO: this should be ambiguous
            childType: DeclarationType.ServiceEntry,
            referenceType: BellaReferenceType.NestedReference,
            // container: this.inferProcedureDeclaration(context)
        };

        // TODO: add ambiguous context for mapping resolution inside registry
        let result = [
            container,
            invocationExpression
        ];
        return this.accumulateResult(result);
    }

    visitObjectExtension(context: ObjectExtensionContext): BellaReference[] {
        return this.accumulateResult(this.visitIdentifierLocal(context.Identifier(), DeclarationType.Object, false));
    }

    private inferProcedureDeclaration(ruleContext: ParserRuleContext): ReferenceIdentifier | undefined {
        // infer procedure name as container
        let maxDepth = 15;
        let currentDepthLevel = 0;
        let containerContext = ruleContext.parent;
        while (!!ruleContext.parent && !(containerContext instanceof ProcedureDeclarationContext) && currentDepthLevel < maxDepth) {
            currentDepthLevel++;
            containerContext = containerContext?.parent;
        }
        let result: ReferenceIdentifier | undefined;
        let containerProcedureContext = containerContext as ProcedureDeclarationContext;
        if (containerProcedureContext instanceof ProcedureDeclarationContext) {
            result = {
                //TODO: potential error in case when procedure name is "PrimitiveType"or "Error"
                nameTo: containerProcedureContext.generalSignature().Identifier().text,
                referenceTo: DeclarationType.Procedure
            }
        }
        return result;
    }

    visitGenericInvocationLocal(context: GenericInvocationContext): BellaReference[] {
        let genericInvocationContext = context.explicitGenericInvocation();
        if (!genericInvocationContext) {
            return [];
        }
        let identifier = genericInvocationContext.Identifier()
            || genericInvocationContext.Error()
            || genericInvocationContext.PrimitiveType();
        // but procedure will not be defined this scope, it it semantically true, but not real case
        let identifierReference = (this.visitIdentifierLocal(identifier, DeclarationType.Procedure, false)[0]);
        let result: BellaAmbiguousReference[] = [{
            ...identifierReference,
            possibleTypes: [{
                nameTo: identifierReference.nameTo,
                referenceTo: DeclarationType.Formula
            }]
        }];
        return result;
    }

    //this doesn't mutate accumulated results
    private visitTypeLocal(context: TypeContext): BellaReference[] {
        let collectionCtx = context.collectionDeclaration();
        let identifier = context.Identifier();
        if (collectionCtx) {
            return this.visitCollectionDeclaration(collectionCtx);
        }
        if (identifier) {
            let result: BellaReference[] = [{
                nameTo: identifier.text,
                referenceTo: DeclarationType.Object,
                range: BellaVisitorUtils.getRangeForTerminalNode(identifier),
                isDeclaration: false
            }];
            return result;
        }
        return [];
    }

    visitCollectionDeclaration(context: CollectionDeclarationContext): BellaReference[] {
        let arrayDeclaration = context.arrayDeclaration()
        if (!!arrayDeclaration) {
            return this.visitArrayDeclaration(arrayDeclaration);
        }
        let dictionaryDeclaration = context.dictionaryDeclaration();
        if (!!dictionaryDeclaration) {
            return this.visitDictionaryDeclaration(dictionaryDeclaration);
        }
        return [];
    }

    visitDictionaryDeclaration(context: DictionaryDeclarationContext) {
        let result = [
            ...this.visitIdentifierLocal(
                context.Identifier(), DeclarationType.Object),
            ...this.visitTypeLocal(context.type())
        ];
        // return this.accumulateResult(result);
        return result;
    }

    visitArrayDeclaration(context: ArrayDeclarationContext) {
        let identifier = context.Identifier();
        let result: BellaReference[] = this.visitIdentifierLocal(
            identifier, DeclarationType.Object
        );
        // return this.accumulateResult(result);
        return result;
    }

    visitServiceDeclarationEntry(context: ServiceDeclarationEntryContext) {
        let procedureParamCtx = context.procedureParamList();
        let returnTypeCtx = context.type();
        let result = [
            ...this.visitIdentifierLocal(
                context.Identifier(), DeclarationType.Procedure, false),
        ];
        if (procedureParamCtx) {
            //TODO: fix this, it might contain bug if param return more than one declarations
            let params = procedureParamCtx.procedureParam()
                .map(pp => this.visitTypeLocal(pp.type())[0]).filter(i => i !== undefined);
            result.push(...params);
        }
        if (returnTypeCtx) {
            result.push(...this.visitTypeLocal(returnTypeCtx));
        }
        return this.accumulateResult(result);
        // return result;
    }

    visitIdentifierLocal(
        node: TerminalNode | undefined,
        referenceTo: DeclarationType,
        isDeclaration: boolean = false): BellaReference[] {
        if (!node) {
            return [];
        }
        let result: BellaReference[] = [{
            nameTo: node.text,
            referenceTo,
            range: BellaVisitorUtils.getRangeForTerminalNode(node),
            isDeclaration
        }]
        return result;
    }

    private accumulateResult(refs: BellaReference[]) {
        this.references.push(...refs);
        return refs;
    }

}
