import { Middleware, ResolveCodeLensSignature, Location } from "vscode-languageclient";
import * as vscode from 'vscode';

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

                        // codeLensToFix.command.arguments = [
                        //     vscode.Uri.parse(oldArgs[0]),
                        //     new vscode.Position(oldArgs[1].Line, oldArgs[1].Character),
                        //     oldArgs[2].map((position) => {
                        //         return new vscode.Location(
                        //             vscode.Uri.parse(position.Uri),
                        //             new vscode.Range(
                        //                 position.Range.Start.Line,
                        //                 position.Range.Start.Character,
                        //                 position.Range.End.Line,
                        //                 position.Range.End.Character));
                        //     }),
                        // ];
                        let fixedUri = vscode.Uri.parse(oldArgs[0]);
                        let locations: vscode.Location[] = oldArgs[2].map((position) => {
                            return new vscode.Location(
                                vscode.Uri.parse(position.uri),
                                new vscode.Range(
                                    position.range.start.line,
                                    position.range.start.character,
                                    position.range.end.line,
                                    position.range.end.character));
                        });
                        let newArgs = [
                            fixedUri,
                            new vscode.Position(oldArgs[1].line, oldArgs[1].character),
                            locations
                        ]
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
