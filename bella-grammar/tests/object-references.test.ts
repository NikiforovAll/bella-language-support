import { expect } from 'chai';
import { BellaErrorStrategy, BellaLanguageSupport, ProcedureDeclaration, DeclarationType } from '../src/lib';


describe("simple-object-references", () => {
    it("should return refs for object", () => {
        let input = `object AliasName: Test`;
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor();
        visitor.visit(tree);
        let refs = visitor.references;
        expect(refs).to.have.lengthOf(1);
        let [ r ] = refs;
        expect(r.referenceTo).to.equal(DeclarationType.Object);
        expect(r.nameTo).to.equal("Test");
    });
});
