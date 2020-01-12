import * as LSP from 'vscode-languageserver'
import { TextDocument, Diagnostic } from 'vscode-languageserver';
import { DiagnosticsFactory } from '../factories/diagnostics.factory';


// The example settings
interface DiagnosticsSettings {
    maxNumberOfProblems: number;
}


export class DiagnosticsHandler {

    constructor(private connection: LSP.Connection) {
    }
    async validateTextDocument(textDocument: TextDocument): Promise<void> {
        // TODO: this should not be defined on this level
        const settings: DiagnosticsSettings = { maxNumberOfProblems: 10 };
        let text = textDocument.getText();
        // let pattern = /out\s+(\w+)/g;
        // TODO: know issue, it doesn't work if procedure is defined as last in this file and there is no capturing end tokens for this case and $ symbol as end of line doesn't work
        let pattern = /(?=(?<!\bcall\b.*?)out\s+(\w+\b))(?:[\s\S]*?)(?<matched>[^/]\s\1\b\s*\=|(?<stop>procedure|formula|generic|specific|object|setting|service|hosted|persistent|external))/g;
        let m: RegExpExecArray | null;
        // var result = text.match(new RegExp(number + '\\s(\\w+)'))[1];
        // pattern2 = /(?<=out\s+(\w+\b))(?:[\s\S]*)(?:procedure|object|formula|generic|specific)
        let problems = 0;
        let diagnostics: Diagnostic[] = [];
        while ((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {

            let localParamIndexOf = m[0].indexOf(m[1]);
            let capturedOutParam = {
                name: m[1],
                start: m.index + localParamIndexOf,
                end: m.index + localParamIndexOf + (m[1] || '').length
            };
            let declarationPerformed = !m[3];
            if (!declarationPerformed) {
                let pattern = /out\s+(\w+)/g;
                let factory = new DiagnosticsFactory(false);
                let range = {
                    start: textDocument.positionAt(capturedOutParam.start),
                    end: textDocument.positionAt(capturedOutParam.end)
                }
                let diagnostic = factory.createDiagnostics(
                    range,
                    `Output parameter "${capturedOutParam.name}" is declared but never assigned.`,
                    textDocument.uri
                )
                diagnostics.push(diagnostic);
                problems++;
            }

        }
        // Send the computed diagnostics to VSCode.
        this.connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
    }
}
