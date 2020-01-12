import { BellaLanguageSupport, ThrowingErrorListener } from "../src/lib/index";
import { expect } from "chai";
import { BellaRecognitionException } from "../src/lib/error-listener";
import { BellaDeclarationVisitor } from "../src/lib/bella-declaration.visitor";
import { BellaErrorStrategy } from "../src/lib/bella-error-strategy";

describe("throws-error", () => {
    it("should throw error during parsing", () => {
        let input = `=`;
        let visitor: BellaDeclarationVisitor;
        expect( () =>{
            let tree = BellaLanguageSupport.parseWithErrorListener(input, ThrowingErrorListener.INSTANCE);
            // let tree = BellaLanguageSupport.parse(input);
            visitor = BellaLanguageSupport.generateVisitor() as BellaDeclarationVisitor;
            visitor.visit(tree);
        }).to.throw(BellaRecognitionException, /extraneous/g, "Error doesn't contain 'extraneous' in it");
    });
});

describe("throws-error-with-error-strategy", () => {
    it("should throw error during parsing", () => {
        let input = `=`;
        // let visitor: BellaDeclarationVisitor;
        expect( () =>{
            let tree = BellaLanguageSupport.parseWithErrorStrategy(input, new BellaErrorStrategy());
            // let tree = BellaLanguageSupport.parse(input);
        }).to.throw();
    });
});
