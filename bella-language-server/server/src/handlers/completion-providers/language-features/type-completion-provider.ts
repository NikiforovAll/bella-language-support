import { DeclarationType } from 'bella-grammar';
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { MultipleSourceCompletionProvider } from '../multiple-source-completion-provider';
import { StringTypeCompletionProvider } from './string-type-completion-provider';
import { ExclusiveSourceCompletionProvider } from '../exclusive-source-completion-provider';
import { BaseCompletionProvider } from '../completion-provider';

/**
 * Built-in types
 */
export class TypeCompletionProvider extends BaseCompletionProvider {
    provider: MultipleSourceCompletionProvider;

    constructor(objectName: string) {
        super();
        this.provider = new ExclusiveSourceCompletionProvider(
            new StringTypeCompletionProvider(objectName)
        );
    }
    getCompletions(): CompletionItem[] {
        return this.provider.getCompletions();
    }
}
