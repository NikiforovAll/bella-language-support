import { DeclarationType, BellaCompletionTrigger} from 'bella-grammar';
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
        let completionToken = this.completions.getCompletion(
            params.position.line,
            params.position.character,
            this.docUri
        );

        let providers = [];
        if (!completionToken) {
            providers = [
                new KeywordCompletionProvider(),
                this.createProvider(DeclarationType.PersistentObject),
                this.createProvider(DeclarationType.Object),
                this.createProvider(DeclarationType.Service)
            ]
        } else {
            providers = this.createProviders(completionToken);
        }
        return new MultipleSourceCompletionProvider(...providers).getCompletions();
    }

    private createProviders(context: BellaCompletionTrigger): CompletionProvider[] {
        return context.expectedCompletions.map(t => this.createProvider(t, context));
    }

    private createProvider(expectedCompletionType: DeclarationType, context?: BellaCompletionTrigger,
        ): CompletionProvider {
        switch (expectedCompletionType) {
            case DeclarationType.Procedure:
                return new ProcedureCompletionProvider(this.cache, this.docUri);
                break;
            case DeclarationType.Object:
                return new ObjectCompletionProvider(this.cache, this.docUri);
            case DeclarationType.PersistentObject:
                return new PersistentObjectCompletionProvider(this.cache, this.docUri);
            case DeclarationType.ObjectField:
                const completionSource = context?.completionBase?.completionSource?.pop();
                const completionSourceName = completionSource?.name;
                if(!completionSourceName || completionSource?.type !== DeclarationType.Object){
                    throw new Error('Completion source could not be resolved, please provide correct one');
                }
                return new ObjectFieldCompletionProvider(this.cache, this.docUri, completionSourceName);
            case DeclarationType.Service:
                return new ServiceCompletionProvider(this.cache, this.docUri);
            default:
                throw new Error('Completion provider could not be resolved');
                break;
        }
    }
}


