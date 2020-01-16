import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor';
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';

import {
    ArrayDeclarationContext,
    CallStatementContext,
    CollectionDeclarationContext,
    DictionaryDeclarationContext,
    ServiceDeclarationEntryContext,
    TypeContext,
} from '../grammars/.antlr4/BellaParser';
import { BellaVisitor } from '../grammars/.antlr4/BellaVisitor';
import { BellaReference } from './models/bella-reference';
import { DeclarationType } from './models/declaration-type.enum';
import { BellaVisitorUtils } from './visitor.utils';



export class BellaReferenceVisitor extends AbstractParseTreeVisitor<any> implements BellaVisitor<BellaReference[]> {
    public references: BellaReference[] = [];
    protected defaultResult() {
        return [];
    }
    // visitCompilationUnit(context: CompilationUnitContext) {
    //     return  this.visitType(context.typeDeclaration());
    // }
    // visitObjectDeclaration(context: ObjectDeclarationContext) {
    //     let simpleObjectDeclaration = context.simpleObjectDeclaration();
    //     if(simpleObjectDeclaration) {
    //         return this.visitType(simpleObjectDeclaration.type());
    //     }
    //     return [];
    // }

    visitType(context: TypeContext): BellaReference[] {
        let result = this.visitTypeLocal(context);
        return this.accumulateResult(result);
    }

    visitCallStatement(context: CallStatementContext): BellaReference[] {
        let result = this.visitIdentifierLocal(context.explicitGenericInvocation().Identifier(), DeclarationType.Procedure);
        return this.accumulateResult(result);
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
                range: BellaVisitorUtils.getRangeForTerminalNode(identifier)
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
                context.Identifier(), DeclarationType.Procedure),
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

    visitIdentifierLocal(node: TerminalNode | undefined, referenceTo: DeclarationType): BellaReference[] {
        if (!node) {
            return [];
        }
        let result: BellaReference[] = [{
            nameTo: node.text,
            referenceTo,
            range: BellaVisitorUtils.getRangeForTerminalNode(node)
        }]
        return result;
    }

    private accumulateResult(refs: BellaReference[]) {
        this.references.push(...refs);
        return refs;
    }

}
