import { DeclarationType } from 'bella-grammar';
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { MultipleSourceCompletionProvider } from '../multiple-source-completion-provider';
import { BaseCompletionProvider } from '../completion-provider';

export class StringTypeCompletionProvider extends BaseCompletionProvider {
    constructor(private objectName: string) {
        super();
    }
    getCompletions(): CompletionItem[] {
        if(this.objectName !== 'String') {
            return [];
        }
        return [
            {
                label: 'Trim',
                detail: 'String.Trim()',
                kind: CompletionItemKind.Function,
                documentation: {
                    value: `Returns a new string in which all leading and trailing occurrences of a set of specified characters from the current string are removed.`,
                    kind: "markdown"
                }
            },
            {
                label: 'Replace',
                detail: 'String.Replace(str1, str2)',
                kind: CompletionItemKind.Function,
                documentation: {
                    value: `Returns a new string in which all occurrences of a specified string in the current instance are replaced with another specified string.`,
                    kind: "markdown"
                }
            },
            {
                label: 'IsMatch',
                detail: 'String.IsMatch(Pattern)',
                kind: CompletionItemKind.Function,
                documentation: {
                    value: `Returns a new string in which all occurrences of a specified string in the current instance are replaced with another specified string.`,
                    kind: "markdown"
                }
            },
        ]
    }
}
