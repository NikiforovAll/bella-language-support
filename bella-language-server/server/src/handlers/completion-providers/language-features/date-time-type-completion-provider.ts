import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

import { BaseCompletionProvider } from '../general-purpose-providers/completion-provider';

const REFERENCE: CompletionItem[] = [
    {
        label: 'Date',
        detail: 'DateTime.Date()',
        kind: CompletionItemKind.Function,
        documentation: {
            value: `Returns Date part of DateTime.`,
            kind: "markdown"
        }
    },
];
export class DateTimeTypeCompletionProvider extends BaseCompletionProvider {
    toCompletionItem(declaration: import("../../../registry/declaration-registry/lsp-declaration-registry").KeyedDeclaration): CompletionItem {
        throw new Error("Method not implemented.");
    }
    constructor(private objectName?: string) {
        super();
    }
    getCompletions(): CompletionItem[] {
        const sourceString = this.objectName;
        if (sourceString === 'DateTime') {
            return REFERENCE;
        } else if (!sourceString) {
            return [
                {
                    label: 'DateTime',
                    detail: 'System.DateTime',
                    kind: CompletionItemKind.Class,
                    documentation: {
                        value: ``,
                        kind: "markdown"
                    }
                }
            ];
        }
        return [];
    }
}
