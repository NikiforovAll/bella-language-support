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
        let refs = visitor.references.filter(r => r.referenceTo === DeclarationType.Procedure);
        expect(refs).to.have.lengthOf(1);
    });
});
