import { CompletionItem } from 'vscode-languageserver';
import { CompletionProvider, BaseCompletionProvider } from './completion-provider';
import { KeyedDeclaration } from '../../registry/declaration-registry/lsp-declaration-registry';
export class MultipleSourceCompletionProvider extends BaseCompletionProvider {
    toCompletionItem(declaration: KeyedDeclaration): CompletionItem {
        throw new Error("Method not implemented.");
    }
    getCompletions(): CompletionItem[] {
        return this.providers
            .map(p => p.getCompletions())
            .reduce((acc, completion) => acc.concat(completion));
    }
    providers: CompletionProvider[];
    constructor(...providers: CompletionProvider[]) {
        super();
        this.providers = providers;
    }
}
