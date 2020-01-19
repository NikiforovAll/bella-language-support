import { expect } from 'chai';
import { BellaErrorStrategy, BellaLanguageSupport, ProcedureDeclaration, DeclarationType, VisitorType } from '../src/lib';
import { BellaReferenceVisitor } from '../src/lib/bella-reference.visitor';


describe("alias-refs", () => {
    it("should return refs for object", () => {
        let input = `object AliasName: Test`;
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor(VisitorType.ReferencesVisitor) as BellaReferenceVisitor;
        visitor.visit(tree);
        let refs = visitor.references;
        expect(refs).to.have.lengthOf(1);
        let [ r ] = refs;
        expect(r.referenceTo).to.equal(DeclarationType.Object);
        expect(r.nameTo).to.equal("Test");
    });
});

describe("alias-array-refs", () => {
    it("should return refs for object with returning type array", () => {
        let input = `object AliasName: Test[*]`;
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor(VisitorType.ReferencesVisitor) as BellaReferenceVisitor;
        visitor.visit(tree);
        let refs = visitor.references;
        expect(refs).to.have.lengthOf(1);
        let [ r ] = refs;
        expect(r.referenceTo).to.equal(DeclarationType.Object);
        expect(r.nameTo).to.equal("Test");
    });
});

describe("alias-dict-refs", () => {
    it("should return refs for object with returning type map", () => {
        let input = `object AliasName: Test[IdKey]`;
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor(VisitorType.ReferencesVisitor) as BellaReferenceVisitor;
        visitor.visit(tree);
        let refs = visitor.references;
        expect(refs).to.have.lengthOf(2);
        let [ r1, r2 ] = refs;
        expect(r1.referenceTo).to.equal(DeclarationType.Object);
        expect(r2.referenceTo).to.equal(DeclarationType.Object);
        expect(r1.nameTo).to.equal("Test");
        expect(r2.nameTo).to.equal("IdKey");
    });
});

describe("localVariableAssignment-refs", () => {
    it("should return refs for local declarations", () => {
        let input = `
procedure SaveGlEvent(GlEvent, SourceCreationDate)
    SourceCreationDate = SourceCreationDate.Date() as DateTime
    if not IsEmpty(GlEventsByDate[SourceCreationDate][GlEvent.eventType][GlEvent.sourceId].currentGlEvent)
        GlEventLog = GlEventsByDate[SourceCreationDate][GlEvent.eventType][GlEvent.sourceId]
        GlEventLog.historyGlEvents ++= GlEventLog.currentGlEvent
        GlEventLog.currentGlEvent = GlEvent
    else
        GlEventsByDate[SourceCreationDate][GlEvent.eventType][GlEvent.sourceId].currentGlEvent = GlEvent`;
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor(VisitorType.ReferencesVisitor) as BellaReferenceVisitor;
        visitor.visit(tree);
        let refs = visitor.references.filter(r => r.referenceTo === DeclarationType.Object && !r.isDeclaration);
        expect(refs).to.have.lengthOf(4);
    });
});
