import { CompletionItem } from 'vscode-languageserver';
export interface CompletionProvider {
    getCompletions(): CompletionItem[];
}
