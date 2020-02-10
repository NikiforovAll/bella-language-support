import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

import { BaseCompletionProvider } from './completion-provider';

export class KeywordCompletionProvider extends BaseCompletionProvider {
    getCompletions(): CompletionItem[] {
        return [
            {
                label: 'new',
                insertText: 'new ',
                kind: CompletionItemKind.Keyword
            },
            {
                label: 'call',
                insertText: 'call ',
                kind: CompletionItemKind.Keyword
            },
            {
                label: 'let',
                insertText: 'let ',
                kind: CompletionItemKind.Keyword
            },
        ];
    }
}
