import { BellaLanguageSupport } from "../src/lib/index";
import { expect } from "chai";
import { BellaDeclarationVisitor } from "../src/lib/bella-declaration.visitor";

describe("component-hosted-service-declaration", () => {
    it("should return parsed component service", () => {
        let input = "external service InvoiceGenerator on [InvoiceGenerator]";
        // let lexer = BellaLanguageSupport.generateLexer(input);
        // let result = lexer.getAllTokens()
        //     .filter(t => t.channel == 0)
        //     .map(t=>t.text);

        // expect(result)
        //     .to.eql(["external", "service", "InvoiceGenerator", "on", "[" , "InvoiceGenerator" , "]"], 'failed tokenization');
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor() as BellaDeclarationVisitor;
        visitor.visit(tree);
        let serviceDeclarations = visitor.declarations;
        expect(serviceDeclarations).to.have.lengthOf(1);
    });
});

