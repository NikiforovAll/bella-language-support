import { BellaLanguageSupport } from "bella-grammar";

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
        let declarations = visitor.declarations;
        return declarations;
    }
}
