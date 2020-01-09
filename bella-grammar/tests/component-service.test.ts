import { BellaLanguageSupport } from "../src/lib/index";
import { expect } from "chai";

describe("component-hosted-service-declaration", () => {
    it("should return parsed tokens", () => {
        let input = "external service InvoiceGenerator on [InvoiceGenerator]";
        let lexer = BellaLanguageSupport.generateLexer(input);
        let result = lexer.getAllTokens()
            .filter(t => t.channel == 0)
            .map(t=>t.text);

        expect(result)
            .to.eql(["external", "service", "InvoiceGenerator", "on", "[" , "InvoiceGenerator" , "]"], 'failed tokenization');
        let tree = BellaLanguageSupport.generateTree(input);
        let visitor = BellaLanguageSupport.generateVisitor();
        let visitorRes = visitor.visit(tree);
        let serviceDeclarations = visitor.declarations;
        expect(serviceDeclarations).to.have.lengthOf(1);
    });
});

