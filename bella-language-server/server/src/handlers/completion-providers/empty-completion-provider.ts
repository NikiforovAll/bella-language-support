import { CompletionProvider, BaseCompletionProvider } from "./completion-provider";
import { CompletionItem } from "vscode-languageserver";

export class EmptyCompletionProvider extends BaseCompletionProvider{
    getCompletions(): CompletionItem[] {
        return [];
    }
}
