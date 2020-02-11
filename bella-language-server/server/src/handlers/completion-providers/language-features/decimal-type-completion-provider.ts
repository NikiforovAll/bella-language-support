import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

import { BaseCompletionProvider } from '../completion-provider';

const REFERENCE: CompletionItem[] = [
    {
        label: 'Round1',
        detail: 'Decimal|Double.Round1()',
        kind: CompletionItemKind.Function,
        documentation: {
            value: `Rounds a decimal value to a specified number of fractional digits, and rounds midpoint values to the nearest even number. [Round(Value, 2)]`,
            kind: "markdown"
        }
    },
];
export class DecimalTypeCompletionProvider extends BaseCompletionProvider {
    constructor(private objectName?: string) {
        super();
    }
    getCompletions(): CompletionItem[] {
        const sourceString = this.objectName;
        if ((sourceString === 'Decimal') || (sourceString === 'Double')) {
            return REFERENCE;
        } else if (!sourceString) {
            return [
                {
                    label: 'Decimal',
                    detail: 'System.Decimal',
                    kind: CompletionItemKind.Class,
                    documentation: {
                        value: ``,
                        kind: "markdown"
                    }
                },
                {
                    label: 'Double',
                    detail: 'System.Double',
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
