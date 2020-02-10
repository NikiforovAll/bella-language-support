import { CompletionItem } from 'vscode-languageserver';
import { CompletionProvider, BaseCompletionProvider } from './completion-provider';
export class MultipleSourceCompletionProvider extends BaseCompletionProvider {
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
