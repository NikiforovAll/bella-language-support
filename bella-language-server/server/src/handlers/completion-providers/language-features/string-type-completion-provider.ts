import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

import { BaseCompletionProvider } from '../completion-provider';

const REFERENCE: CompletionItem[] = [
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
        detail: 'RegExp.IsMatch(String)',
        kind: CompletionItemKind.Function,
        documentation: {
            value: `Returns a new string in which all occurrences of a specified string in the current instance are replaced with another specified string.`,
            kind: "markdown"
        }
    },
    {
        label: 'ToLower',
        detail: 'String.ToLower()',
        kind: CompletionItemKind.Function,
        documentation: {
            value: `Returns a copy of this string converted to lowercase.`,
            kind: "markdown"
        }
    },
    {
        label: 'Split',
        detail: 'String.Split(separator)',
        kind: CompletionItemKind.Function,
        documentation: {
            value: `Splits a string into substrings based on the characters in an array. You can specify whether the substrings include empty array elements.`,
            kind: "markdown"
        }
    },
];
export class StringTypeCompletionProvider extends BaseCompletionProvider {
    toCompletionItem(declaration: import("../../../registry/declaration-registry/lsp-declaration-registry").KeyedDeclaration): CompletionItem {
        throw new Error("Method not implemented.");
    }
    constructor(private objectName?: string) {
        super();
    }
    getCompletions(): CompletionItem[] {
        const sourceString = this.objectName;
        if (sourceString === 'String') {
            return REFERENCE;
        } else if (!sourceString) {
            return [
                {
                    label: 'String',
                    detail: 'System.String',
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
