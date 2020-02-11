import { DeclarationType, BellaCompletionTrigger } from 'bella-grammar';
import { DeclarationIdentifier, CompletionScope } from 'bella-grammar/dist/lib/models/bella-completion';
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
import { ExclusiveSourceCompletionProvider } from './completion-providers/exclusive-source-completion-provider';
import { FormulaCompletionProvider } from './completion-providers/formula-completion-provider';
import { CompletionUtils, ResolvedTypeResult } from '../utils/completion.utils';
import { EmptyCompletionProvider } from './completion-providers/empty-completion-provider';
import { TypeCompletionProvider } from './completion-providers/language-features/type-completion-provider';
import { resolve } from 'dns';


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
        let ambientScopeProviders = [
            new KeywordCompletionProvider(),
            this.createProvider(DeclarationType.PersistentObject),
            this.createProvider(DeclarationType.Object),
            this.createProvider(DeclarationType.Service),
            this.createProvider(DeclarationType.Enum)
        ];
        if (completionTokens.length === 0) {
            //global scope
            providers = ambientScopeProviders;
        } else {
            providers = this.createProvidersForCompletionTriggers(completionTokens);
            if (completionTokens.every(t => t.scope !== CompletionScope.Block)) {
                providers.push(...ambientScopeProviders);
            }
        }
        return new MultipleSourceCompletionProvider(...this.groupExclusiveProviders(providers))
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
        const resolvedTypes = CompletionUtils.extractCompletionSourceName(this.cache, this.docUri, context);
        return context.expectedCompletions.map(t => this.createProvider(t, resolvedTypes));
    }

    private groupExclusiveProviders(providers: CompletionProvider[]) {
        const providerResult: CompletionProvider[] = [];
        const groups = [
            [
                DeclarationType.ObjectField,
                DeclarationType.ServiceEntry,
                DeclarationType.Type
            ]
        ];
        const isInGroups = (p: CompletionProvider, groups: DeclarationType[][]) =>
            p.getCompletionTypes()
                .some(t => groups.some(g => g.includes(t)));

        for (const group of groups) {
            const groupedProviders = providers.filter(p => isInGroups(p, [group]));
            providerResult.push(new ExclusiveSourceCompletionProvider(...groupedProviders))
        }
        providerResult.push(...providers.filter(p => !isInGroups(p, groups)));
        return providerResult;
    }

    private createProvider(
        expectedCompletionType: DeclarationType, resolvedTypes?: ResolvedTypeResult[],
    ): CompletionProvider {
        if (!resolvedTypes) {
            // WARNING: this sets default value for nullable field
            return this.createProviderFromSourceName(expectedCompletionType, '');
        }

        const providers = resolvedTypes.map(rt => this.createProviderByType(expectedCompletionType, rt));
        if (resolvedTypes.length > 1) {
            //TODO: this impact exclusive provider, error-prone!
            return new MultipleSourceCompletionProvider(...providers)
        }
        let [singleProvider] = providers;
        return singleProvider;
    }

    private createProviderByType(expectedCompletionType: DeclarationType, resolvedType: ResolvedTypeResult) {
        if (!resolvedType.resolved) {
            return new EmptyCompletionProvider();
        }
        const sourceName = resolvedType.name;
        return this.createProviderFromSourceName(expectedCompletionType, sourceName);
    }

    private createProviderFromSourceName(expectedCompletionType: DeclarationType, sourceName: string) {
        let completionProvider;
        switch (expectedCompletionType) {
            case DeclarationType.Procedure:
                completionProvider = new ProcedureCompletionProvider(
                    this.cache, this.docUri);
                break;
            case DeclarationType.Object:
                completionProvider = new ObjectCompletionProvider(
                    this.cache, this.docUri);
                break;
            case DeclarationType.PersistentObject:
                completionProvider = new PersistentObjectCompletionProvider(
                    this.cache, this.docUri);
                break;
            case DeclarationType.ObjectField:
                completionProvider = new ObjectFieldCompletionProvider(
                    this.cache, this.docUri, sourceName);
                break;
            case DeclarationType.Service:
                completionProvider = new ServiceCompletionProvider(
                    this.cache, this.docUri);
                break;
            case DeclarationType.ServiceEntry:
                completionProvider = new ServiceEntryCompletionProvider(
                    this.cache, this.docUri, sourceName);
                break;
            case DeclarationType.Enum:
                completionProvider = new EnumCompletionProvider(
                    this.cache, this.docUri);
                break;
            case DeclarationType.EnumEntry:
                completionProvider = new EnumEntryCompletionProvider(
                    this.cache, this.docUri, sourceName);
                break;
            case DeclarationType.Formula:
                completionProvider = new FormulaCompletionProvider(
                    this.cache, this.docUri, sourceName);
                break;
            case DeclarationType.Type:
                completionProvider = new TypeCompletionProvider(sourceName);
                break;
            default:
                throw new Error('Completion provider could not be resolved');
        }
        completionProvider.setCompletionTypes([expectedCompletionType]);
        return completionProvider;
    }
}


