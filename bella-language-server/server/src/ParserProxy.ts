import { BellaLanguageSupport } from "bella-grammar";

export class BellaDocumentParser {

    constructor() {
    }
    /**
     * parse
     */
    public parse(input: string)  {
        let tree = BellaLanguageSupport.generateTree(input);
        let visitor = BellaLanguageSupport.generateVisitor();
        let visitorRes = visitor.visit(tree);
        let serviceDeclarations = visitor.services;
        return serviceDeclarations;
    }
}
