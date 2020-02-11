import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

import { BaseCompletionProvider } from '../completion-provider';

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
