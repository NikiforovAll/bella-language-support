import { BellaLanguageSupport, ProcedureDeclaration, ThrowingErrorListener, BellaErrorStrategy } from "../src/lib/index";
import { expect, assert } from "chai";

describe("procedure-declaration", () => {
    it("should return parsed procedure", () => {
        let input = `
procedure TestProcedure(Param1, Param2, out ParamOut1)
    call CreateSpecificTask(BaseTaskCreationRequest, out BaseTask)
    TaskId = BaseTask.id
    TaskCatalog[TaskId] = BaseTask
`;
        const param1 = 'Param1';
        let param1Pos =  {
            startPosition: input.indexOf(param1) - 1,
            endPosition: input.indexOf(param1) + param1.length - 1
        };
        let tree = BellaLanguageSupport.parseWithErrorStrategy(input, new BellaErrorStrategy());
        // let tree = BellaLanguageSupport.parseWithErrorListener(input, ThrowingErrorListener.INSTANCE);
        // let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor();
        visitor.visit(tree);
        let declarations = visitor.declarations;
        expect(declarations).to.have.lengthOf(1);
        let [ declaration ] = declarations as ProcedureDeclaration[];
        expect(declaration.name).to.equal('TestProcedure(Param1,Param2,out ParamOut1)', 'name of simple object is parsed incorrectly');
        expect(declaration.members).to.have.lengthOf(3);
        let m1  = (declaration.members || [])[0];
        expect(m1).to.be.not.undefined;
        expect({
            startPosition:m1.range.startPosition.col,
            endPosition: m1.range.endPosition.col
        }).to.eql(param1Pos);
    });
});


describe("procedure-declaration-generic-specific", () => {
    it("should return parsed generic/specific procedure", () => {
        let input = `
generic procedure Test1(T1, out T2)
    AdditionalTaskInformationItemList = new

specific procedure Test1(TS1, out T2)
    AdditionalTaskInformationItemList = new
    AdditionalTaskInformationItemList ++= AdditionalTaskInformationItem`;

        // let tree = BellaLanguageSupport.parse(input);
        let tree = BellaLanguageSupport.parseWithErrorStrategy(input, new BellaErrorStrategy());

        let visitor = BellaLanguageSupport.generateVisitor();
        visitor.visit(tree);
        let declarations = visitor.declarations;
        expect(declarations).to.have.lengthOf(2);
        let [ d1, d2 ] = declarations as ProcedureDeclaration[];
        expect(d1.name).to.equal('Test1(T1,out T2)', 'declaration is parsed incorrectly');
        expect(d2.name).to.equal('Test1(TS1,out T2)', 'declaration of simple object is parsed incorrectly');
    });
});

describe("procedure-declaration-body-tokens", () => {
    it("should return parsed procedure body", () => {
        let input = `
procedure SaveGlEvent(GlEvent, SourceCreationDate)
    SourceCreationDate = SourceCreationDate.Date() as DateTime
    if not IsEmpty(GlEventsByDate[SourceCreationDate][GlEvent.eventType][GlEvent.sourceId].currentGlEvent)
        GlEventLog = GlEventsByDate[SourceCreationDate][GlEvent.eventType][GlEvent.sourceId]
        GlEventLog.historyGlEvents ++= GlEventLog.currentGlEvent
        GlEventLog.currentGlEvent = GlEvent
    else
        GlEventsByDate[SourceCreationDate][GlEvent.eventType][GlEvent.sourceId].currentGlEvent = GlEvent`;

        // let tree = BellaLanguageSupport.parse(input);
        let tree = BellaLanguageSupport.parseWithErrorStrategy(input, new BellaErrorStrategy());
        let visitor = BellaLanguageSupport.generateVisitor();
        visitor.visit(tree);
        let declarations = visitor.declarations;
        expect(declarations).to.have.lengthOf(1);
    });
});

