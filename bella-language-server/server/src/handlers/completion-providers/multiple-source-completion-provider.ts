import { CompletionItem } from 'vscode-languageserver';
import { CompletionProvider } from './completion-provider';
export class MultipleSourceCompletionProvider implements CompletionProvider {
    getCompletions(): CompletionItem[] {
        return this.providers
            .map(p => p.getCompletions())
            .reduce((acc, completion) => acc.concat(completion));
    }
    providers: CompletionProvider[];
    constructor(...providers: CompletionProvider[]) {
        this.providers = providers;
    }
}
