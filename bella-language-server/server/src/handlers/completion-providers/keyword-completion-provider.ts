import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

import { BaseCompletionProvider } from './general-purpose-providers/completion-provider';
import { KeyedDeclaration } from '../../registry/declaration-registry/lsp-declaration-registry';

export class KeywordCompletionProvider extends BaseCompletionProvider {
    toCompletionItem(declaration: KeyedDeclaration): CompletionItem {
        throw new Error("Method not implemented.");
    }
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
