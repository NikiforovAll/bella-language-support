import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

import { BaseCompletionProvider } from '../completion-provider';

const REFERENCE: CompletionItem[] = [

];
export class BooleanTypeCompletionProvider extends BaseCompletionProvider {
    toCompletionItem(declaration: import("../../../registry/declaration-registry/lsp-declaration-registry").KeyedDeclaration): CompletionItem {
        throw new Error("Method not implemented.");
    }
    constructor(private objectName?: string) {
        super();
    }
    getCompletions(): CompletionItem[] {
        const sourceString = this.objectName;
        if (sourceString === 'Boolean') {
            return REFERENCE;
        } else if (!sourceString) {
            return [
                {
                    label: 'Boolean',
                    detail: 'System.Boolean',
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
