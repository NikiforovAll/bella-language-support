import { BellaLanguageSupport, BaseDeclaration, BellaReference, VisitorType, ThrowingErrorListener } from "bella-grammar";
import { BellaDeclarationVisitor } from "bella-grammar/dist/lib/bella-declaration.visitor";
import { BellaReferenceVisitor } from "bella-grammar/dist/lib/bella-reference.visitor";
import { BellaCompletionVisitor } from "bella-grammar/dist/lib/bella-completion.visitor";

export class LSPParserProxy {

    constructor() {
    }
    /**
     * parse
     */
    public parse(input: string)  {
        let tree = BellaLanguageSupport.parse(input);
        // let tree = BellaLanguageSupport.parseWithErrorListener(input, ThrowingErrorListener.INSTANCE)
        let declarationVisitor =
            BellaLanguageSupport.generateVisitor() as BellaDeclarationVisitor;
        let referenceVisitor =
            BellaLanguageSupport.generateVisitor(VisitorType.ReferencesVisitor) as BellaReferenceVisitor;
        declarationVisitor.visit(tree);
        referenceVisitor.visit(tree);
        let {declarations} = declarationVisitor;
        let {references} = referenceVisitor;
        return {
            declarations, references
        };
    }

    public scanForCompletions(input: string) {
        let tree = BellaLanguageSupport.parse(input);
            BellaLanguageSupport.generateVisitor() as BellaDeclarationVisitor;
        let completionVisitor = BellaLanguageSupport.generateVisitor(VisitorType.CompletionVisitor) as BellaCompletionVisitor;
        completionVisitor.visit(tree);
        let { triggers } = completionVisitor;
        return {
            triggers
        };
    }

}

export interface ParsingResult {
    declarations: BaseDeclaration[];
    references: BellaReference[];
}
