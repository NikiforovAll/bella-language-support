import { expect } from 'chai';
import { BellaErrorStrategy, BellaLanguageSupport, ProcedureDeclaration } from '../src/lib';


describe("procedure-references", () => {
    it("should return refs for procedure", () => {
        let input = `
procedure TestProcedure(Param1, Param2, out ParamOut1)
    call CreateSpecificTask(BaseTaskCreationRequest, out BaseTask)
    TaskId = BaseTask.id
    TaskCatalog[TaskId] = BaseTask
`;
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor();
        visitor.visit(tree);
        let refs = visitor.references;
        expect(refs).to.have.lengthOf(1);
    });
});
