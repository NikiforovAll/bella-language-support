import { CompletionItem } from 'vscode-languageserver';

import { KeyedDeclaration } from '../../registry/declaration-registry/lsp-declaration-registry';
import { BaseCompletionProvider, CompletionProvider } from './completion-provider';

export type Predicate = (...args:any[]) => boolean;

export class FilteredCompletionProvider extends BaseCompletionProvider {

    constructor(
        private provider: CompletionProvider,
        private filter: Predicate, private recordFilter?: Predicate) {
        super();
    }

    toCompletionItem(declaration: KeyedDeclaration): CompletionItem {
        throw new Error("Method not implemented.");
    }
    getCompletions(): CompletionItem[] {
        const completions = this.provider.getCompletions();
        if(!this.filter(completions)){
            return [];
        }
        if(!!this.recordFilter) {
            throw new Error('recordFilter is not implemented');
        }
        return completions;
    }
}
