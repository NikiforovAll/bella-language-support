import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

import { BaseCompletionProvider } from '../completion-provider';

const REFERENCE: CompletionItem[] = [

];
export class DateTypeCompletionProvider extends BaseCompletionProvider {
    constructor(private objectName?: string) {
        super();
    }
    getCompletions(): CompletionItem[] {
        const sourceString = this.objectName;
        if (sourceString === 'Date') {
            return REFERENCE;
        } else if (!sourceString) {
            return [
                {
                    label: 'Date',
                    detail: 'System.Date',
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
