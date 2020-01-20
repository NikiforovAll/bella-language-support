import { expect } from 'chai';
import { BellaErrorStrategy, BellaLanguageSupport, ProcedureDeclaration, VisitorType, DeclarationType } from '../src/lib';
import { BellaReferenceVisitor } from '../src/lib/bella-reference.visitor';


describe("procedure-references", () => {
    it("should return refs for procedure", () => {
        let input = `
procedure TestProcedure(Param1, Param2, out ParamOut1)
    call CreateSpecificTask(BaseTaskCreationRequest, out BaseTask)
    TaskId = BaseTask.id
    TaskCatalog[TaskId] = BaseTask
`;
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor(VisitorType.ReferencesVisitor) as BellaReferenceVisitor;
        visitor.visit(tree);
        let refs = visitor.references.filter(r => r.referenceTo === DeclarationType.Procedure && !r.isDeclaration);
        expect(refs).to.have.lengthOf(1);
        // expect(refs[0].container?.nameTo).to.be.equal('TestProcedure');
        let refs2 = visitor.references.filter(r => r.referenceTo === DeclarationType.Procedure && r.isDeclaration);
        expect(refs2).to.have.lengthOf(1);
    });
});

describe("procedure-references", () => {
    it("should return refs for procedure", () => {
        let input = `
procedure TestProcedure(Param1, Param2, out ParamOut1)
    TaskService.CreateSpecificTask(BaseTaskCreationRequest, out BaseTask)
`;
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor(VisitorType.ReferencesVisitor) as BellaReferenceVisitor;
        visitor.visit(tree);
        let refs = visitor.references.filter(r => r.referenceTo === DeclarationType.Service && !r.isDeclaration);
        expect(refs).to.have.lengthOf(1);
        // expect(refs[0].container?.nameTo).to.be.equal('TestProcedure');
    });
});
