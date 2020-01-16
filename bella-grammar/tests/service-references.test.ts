import { expect } from 'chai';
import { BellaErrorStrategy, BellaLanguageSupport, ProcedureDeclaration, VisitorType, DeclarationType, ThrowingErrorListener } from '../src/lib';
import { BellaReferenceVisitor } from '../src/lib/bella-reference.visitor';


describe("service-references", () => {
    it("should return refs for service", () => {
        let input = `
service GeneralLedger
    SaveGlEvent(GlEvent, SourceCreationDate) oneway
    SaveGlAccount(GlAccount) oneway
`;
        let tree = BellaLanguageSupport.parseWithErrorListener(input, ThrowingErrorListener.INSTANCE);
        let visitor = BellaLanguageSupport.generateVisitor(VisitorType.ReferencesVisitor) as BellaReferenceVisitor;
        visitor.visit(tree);
        let refs = visitor.references.filter(r => r.referenceTo === DeclarationType.Procedure);
        expect(refs).to.have.lengthOf(2);
    });
});
