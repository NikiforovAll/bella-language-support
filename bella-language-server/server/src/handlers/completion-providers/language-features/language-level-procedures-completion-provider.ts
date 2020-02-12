import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

import { BaseCompletionProvider } from '../completion-provider';

const REFERENCE: CompletionItem[] = [
    {
        label: 'DeepCopy',
        detail: 'System.DeepCopy(Object)',
        kind: CompletionItemKind.Function,
        documentation: {
            value: ``,
            kind: "markdown"
        }
    },
    {
        label: 'With',
        detail: 'System.With(...)',
        kind: CompletionItemKind.Function,
        documentation: {
            value: ``,
            kind: "markdown"
        }
    },
];
export class LanguageLevelProceduresCompletionProvider extends BaseCompletionProvider {
    constructor() {
        super();
    }
    getCompletions(): CompletionItem[] {
        return REFERENCE;
    }
}
