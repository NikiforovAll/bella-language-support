import { BellaLanguageSupport, BaseDeclaration, BellaReference } from "bella-grammar";

export class LSPParserProxy {

    constructor() {
    }
    /**
     * parse
     */
    public parse(input: string)  {
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor();
        visitor.visit(tree);
        let {declarations, references} = visitor;
        return {
            declarations, references
        };
    }

}

export interface ParsingResult {
    declarations: BaseDeclaration[];
    references: BellaReference[];
}
