import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

export class DiagnosticsFactory {
    /**
     *
     */
    constructor(private hasDiagnosticRelatedInformationCapability: boolean) {}
    /**
     * createDiagnostics
    range: Range     */
    public createDiagnostics(range:any, msg:string, uri: string) {
        let diagnostic: Diagnostic = {
            severity: DiagnosticSeverity.Error,
            range: range,
            message: msg,
            source: 'ex'
        };
        if (this.hasDiagnosticRelatedInformationCapability) {
            diagnostic.relatedInformation = [
                {
                    location: {
                        uri: uri,
                        range: Object.assign({}, diagnostic.range)
                    },
                    message: 'Spelling matters'
                },
                {
                    location: {
                        uri: uri,
                        range: Object.assign({}, diagnostic.range)
                    },
                    message: 'Particularly for names'
                }
            ];
        }
        return diagnostic;
    }
}
