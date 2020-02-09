import { DeclarationType, BellaCompletionTrigger } from 'bella-grammar';
import { DeclarationIdentifier } from 'bella-grammar/dist/lib/models/bella-completion';
import { CompletionItem, CompletionParams } from 'vscode-languageserver';

import { LSPCompletionRegistry } from '../registry/completion-registry.ts/lsp-completion-registry';
import { LSPDeclarationRegistry } from '../registry/declaration-registry/lsp-declaration-registry';
import { BaseHandler } from './base.handler';
import { CompletionProvider } from './completion-providers/completion-provider';
import { MultipleSourceCompletionProvider } from './completion-providers/multiple-source-completion-provider';
import { KeywordCompletionProvider } from './completion-providers/keyword-completion-provider';
import { ServiceCompletionProvider } from './completion-providers/service-completion-provider';
import { ProcedureCompletionProvider } from './completion-providers/procedure-completion-provider';
import { ObjectCompletionProvider } from './completion-providers/object-completion-provider';
import { PersistentObjectCompletionProvider } from './completion-providers/persistent-object-completion-provider';
import { ObjectFieldCompletionProvider } from './completion-providers/object-field-completion-provider';
import { ServiceEntryCompletionProvider } from './completion-providers/service-entry-completion-provider';
import { EnumCompletionProvider } from './completion-providers/enum-completion-provider';
import { EnumEntryCompletionProvider } from './completion-providers/enum-entry-completion.provider';


export class CompletionHandler extends BaseHandler {
    docUri: string;
    constructor(
        private cache: LSPDeclarationRegistry,
        private completions: LSPCompletionRegistry) {
        super();
        this.docUri = '';
    }

    public complete(params: CompletionParams): CompletionItem[] {
        this.docUri = params.textDocument.uri;
        let completionTokens = this.completions.getCompletions(
            params.position.line,
            params.position.character,
            this.docUri
        );

        let providers = [];
        if (completionTokens.length === 0) {
            //global scope
            providers = [
                new KeywordCompletionProvider(),
                this.createProvider(DeclarationType.PersistentObject),
                this.createProvider(DeclarationType.Object),
                this.createProvider(DeclarationType.Service),
                this.createProvider(DeclarationType.Enum)
            ]
        } else {
            providers = this.createProvidersForCompletionTriggers(completionTokens);
        }
        return new MultipleSourceCompletionProvider(...providers)
            .getCompletions();
    }


    private createProvidersForCompletionTriggers(context: BellaCompletionTrigger[]): CompletionProvider[] {
        let result: CompletionProvider[] = [];
        for (const trigger of context) {
            result.push(...this.createProviders(trigger));
        }
        return result;
    }

    private createProviders(context: BellaCompletionTrigger): CompletionProvider[] {
        return context.expectedCompletions.map(t => this.createProvider(t, context));
    }

    private createProvider(expectedCompletionType: DeclarationType, context?: BellaCompletionTrigger,
    ): CompletionProvider {
        const sourceName = this.extractCompletionSourceName(context);
        switch (expectedCompletionType) {
            case DeclarationType.Procedure:
                return new ProcedureCompletionProvider(this.cache, this.docUri);
            case DeclarationType.Object:
                return new ObjectCompletionProvider(this.cache, this.docUri);
            case DeclarationType.PersistentObject:
                return new PersistentObjectCompletionProvider(this.cache, this.docUri);
            case DeclarationType.ObjectField:
                return new ObjectFieldCompletionProvider(this.cache, this.docUri, sourceName);
            case DeclarationType.Service:
                return new ServiceCompletionProvider(this.cache, this.docUri);
            case DeclarationType.ServiceEntry:
                return new ServiceEntryCompletionProvider(this.cache, this.docUri, sourceName);
            case DeclarationType.Enum:
                return new EnumCompletionProvider(this.cache, this.docUri);
            case DeclarationType.EnumEntry:
                return new EnumEntryCompletionProvider(this.cache, this.docUri, sourceName);
            default:
                throw new Error('Completion provider could not be resolved');
        }
    }

    private extractCompletionSourceName(context?: BellaCompletionTrigger): string {
        if (!!context) {
            const completionSource = context?.completionBase?.completionSource;
            if (!completionSource) {
                // throw new Error('Completion source could not be resolved, please provide correct one');
                return '<empty source>';
            }
            const completionSourceName = completionSource[0].name;
            return completionSourceName;
        }
        return '<source name is not specified>';
    }
}


