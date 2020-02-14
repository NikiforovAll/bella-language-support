import { BellaLanguageSupport, BaseDeclaration, BellaReference, VisitorType, ThrowingErrorListener, BellaScope } from "bella-grammar";
import { BellaDeclarationVisitor } from "bella-grammar/dist/lib/bella-declaration.visitor";
import { BellaReferenceVisitor } from "bella-grammar/dist/lib/bella-reference.visitor";
import { BellaCompletionVisitor } from "bella-grammar/dist/lib/bella-completion.visitor";
import { BellaScopeVisitor } from "bella-grammar/dist/lib/bella-scope.visitor";
import { TextDocument } from "vscode-languageserver";
import { CommonUtils } from "./utils/common.utils";

export class LSPParserProxy {

    constructor() {
    }
    /**
     * parse
     */
    public parse(input: string) {
        let tree = BellaLanguageSupport.parse(input);
        // let tree = BellaLanguageSupport.parseWithErrorListener(input, ThrowingErrorListener.INSTANCE)
        let declarationVisitor =
            BellaLanguageSupport.generateVisitor() as BellaDeclarationVisitor;
        let referenceVisitor =
            BellaLanguageSupport.generateVisitor(VisitorType.ReferencesVisitor) as BellaReferenceVisitor;
        declarationVisitor.visit(tree);
        referenceVisitor.visit(tree);
        let { declarations } = declarationVisitor;
        let { references } = referenceVisitor;
        return {
            declarations, references
        };
    }

    public scanForCompletions(input: string) {
        let tree = BellaLanguageSupport.parse(input);
        BellaLanguageSupport.generateVisitor();
        let completionVisitor = BellaLanguageSupport.generateVisitor(VisitorType.CompletionVisitor) as BellaCompletionVisitor;
        try{
            completionVisitor.visit(tree);
        }catch{
            console.warn('Parsing error inside BellaCompletionVisitor');
        }
        let { triggers } = completionVisitor;
        return {
            triggers
        };
    }

    public scanForScopes(input: TextDocument) {
        const scopes = this.generateScopes(input.getText());
        for (const scope of scopes) {
            const range = CommonUtils.range(scope.range);
            scope.content = input.getText(range);
        }
        return scopes;
    }

    private generateScopes(input: string): BellaScope[] {
        // let tree = BellaLanguageSupport.parse(input);
        // BellaLanguageSupport.generateVisitor();
        // let scopeVisitor = BellaLanguageSupport
        //     .generateVisitor(VisitorType.ScopeVisitor) as BellaScopeVisitor;
        // scopeVisitor.visit(tree);
        // return scopeVisitor.scopes;

        let scopeVisitor = BellaLanguageSupport
            .generateVisitor(VisitorType.ScopeVisitor) as BellaScopeVisitor;
        const scopes: BellaScope[] = scopeVisitor.visit(input);
        return scopes;
    }

}

export interface ParsingResult {
    declarations: BaseDeclaration[];
    references: BellaReference[];
}
