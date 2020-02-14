import { BellaScope } from './models/bella-scope';
import { BellaVisitorUtils } from './visitor.utils';

export class BellaScopeVisitor {

    public scopes: BellaScope[] = [];

    public visit(context: string): BellaScope[] {
        // let pattern = /(?=(?<!\bprocedure\b.*?)\s+(\w+\b))(?:[\s\S]*?)(?<matched>[^/]\s\1\b\s*\=|(?<stop>procedure|formula|generic|specific|object|setting|service|hosted|persistent|external))/g;
        // const matched = pattern.exec(context);
        const lines = context.split(/\r?\n/);
        const scopes: BellaScope[] = [];
        let isProcedureStart = false;
        let currentProcedure: string = '';
        let procedureStart: number = 0;
        const createProcedure = (lineNumber: number) => (
            {
                name: currentProcedure,
                range: BellaVisitorUtils.createRange(
                    procedureStart + 1, 0, lineNumber
                )
            }
        );
        for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
            const line = lines[lineNumber];
            if (line.startsWith('procedure')) {
                if (!isProcedureStart) {
                    currentProcedure = line;
                    isProcedureStart = true;
                } else {
                    scopes.push(createProcedure(lineNumber));
                }
                currentProcedure = line;
                procedureStart = lineNumber;
            }
            if(lineNumber === lines.length - 1 && isProcedureStart) {
                scopes.push(createProcedure(lineNumber));
            }
        }
        return this.accumulateResult(scopes);
    }

    private accumulateResult(scopes: BellaScope[]) {
        this.scopes.push(...scopes);
        return scopes;
    }
}

// export class BellaScopeVisitor extends AbstractParseTreeVisitor<any> implements BellaVisitor<BellaScope[]> {

//     public scopes: BellaScope[] = [];

//     protected defaultResult() {
//         return [];
//     }

//     private accumulateResult(scopes: BellaScope[]) {
//         this.scopes.push(...scopes);
//         return scopes;
//     }

//     visitProcedureDeclaration(context: ProcedureDeclarationContext): BellaScope[] {
//         const procedureScope: BellaScope = {
//             range: BellaVisitorUtils.createRange(
//                 context.start.line,
//                 context.start.charPositionInLine,
//                 context.stop?.line || context.start.line,
//                 context.stop?.charPositionInLine
//             ),
//             name: context.generalSignature().Identifier().text
//         }
//         return this.accumulateResult([procedureScope]);
//     }
// }
