import { Middleware, ResolveCodeLensSignature, Location } from "vscode-languageclient";
import * as vscode from 'vscode';
import { ClientUtils } from "./utils";

export class SessionManager implements Middleware {
    public resolveCodeLens(
        codeLens: vscode.CodeLens,
        token: vscode.CancellationToken,
        next: ResolveCodeLensSignature): vscode.ProviderResult<vscode.CodeLens> {
            const resolvedCodeLens = next(codeLens, token);
            const resolveFunc =
                (codeLensToFix: vscode.CodeLens): vscode.CodeLens => {
                    if (codeLensToFix.command.command === "editor.action.showReferences") {
                        const oldArgs = codeLensToFix.command.arguments;

                        // Our JSON objects don't get handled correctly by
                        // VS Code's built in editor.action.showReferences
                        // command so we need to convert them into the
                        // appropriate types to send them as command
                        // arguments.
                        let newArgs = ClientUtils.transformPayloadToShowReferences(oldArgs)
                        codeLensToFix.command.arguments = newArgs;
                    }

                    return codeLensToFix;
                };

            if ((resolvedCodeLens as Thenable<vscode.CodeLens>).then) {
                return (resolvedCodeLens as Thenable<vscode.CodeLens>).then(resolveFunc);
            } else if (resolvedCodeLens as vscode.CodeLens) {
                return resolveFunc(resolvedCodeLens as vscode.CodeLens);
            }
            return resolvedCodeLens;
    }
}
