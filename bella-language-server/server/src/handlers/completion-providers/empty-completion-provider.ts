import { CompletionProvider, BaseCompletionProvider } from "./completion-provider";
import { CompletionItem } from "vscode-languageserver";
import { KeyedDeclaration } from "../../registry/declaration-registry/lsp-declaration-registry";

export class EmptyCompletionProvider extends BaseCompletionProvider{
    toCompletionItem(declaration: KeyedDeclaration): CompletionItem {
        throw new Error("Method not implemented.");
    }
    getCompletions(): CompletionItem[] {
        return [];
    }
}
