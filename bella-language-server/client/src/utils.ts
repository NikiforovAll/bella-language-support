import * as vscode from 'vscode';
import { Location } from 'vscode-languageclient';

export namespace ClientUtils{
    export function transformPayloadToShowReferences(oldArgs: any[]){
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
        return newArgs;
    }
}
