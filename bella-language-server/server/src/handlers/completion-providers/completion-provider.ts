import { DeclarationType } from 'bella-grammar';
import { CompletionItem } from 'vscode-languageserver';

export interface CompletionProvider {
    getCompletions(): CompletionItem[];
    setCompletionTypes(types: DeclarationType[]): CompletionProvider;
    getCompletionTypes(): DeclarationType[];
}

export abstract class BaseCompletionProvider implements CompletionProvider {

    protected completionsOf: DeclarationType[] = [];

    abstract getCompletions(): CompletionItem[];

    setCompletionTypes(types: DeclarationType[]): CompletionProvider {
        this.completionsOf = types;
        return this;
    }

    getCompletionTypes(): DeclarationType[] {
        return this.completionsOf;
    }

}
