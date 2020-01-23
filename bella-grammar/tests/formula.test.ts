import { BellaLanguageSupport, ProcedureDeclaration, FormulaDeclaration, ThrowingErrorListener, BellaErrorStrategy } from "../src/lib/index";
import { expect, assert } from "chai";
import { BellaDeclarationVisitor } from "../src/lib/bella-declaration.visitor";
import { BellaReferenceVisitor } from "../src/lib/bella-reference.visitor";
describe("formula-declaration", () => {
    it("should return parsed formula", () => {
        let input = `
formula ToProcessType(Flow):ProcessType = ProcessType.Flow`;
        const param1 = 'Param1';
        let param1Pos =  {
            startPosition: input.indexOf(param1) - 1,
            endPosition: input.indexOf(param1) + param1.length - 1
        };
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor() as BellaDeclarationVisitor;
        visitor.visit(tree);
        let declarations = visitor.declarations;
        expect(declarations).to.have.lengthOf(1);
        let [ declaration ] = declarations as FormulaDeclaration[];
        expect(declaration.name).to.equal('ToProcessType(Flow):ProcessType', 'name of simple object is parsed incorrectly');
    });
});


describe("formula-declaration-generic-specific", () => {
    it("should return parsed generic/specific formula", () => {
        let input = `
generic formula ToProcessName(Flow):ProcessName = empty

specific formula ToProcessName(Order):ProcessName = if(Order.type == OrderType.New,"New contract","Order prolongation")`;

        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor() as BellaDeclarationVisitor;
        visitor.visit(tree);
        let declarations = visitor.declarations;
        expect(declarations).to.have.lengthOf(2);
        let [ d1, d2 ] = declarations as FormulaDeclaration[];
        expect(d1.name).to.equal('ToProcessName(Flow):ProcessName', 'declaration is parsed incorrectly');
        expect(d2.name).to.equal('ToProcessName(Order):ProcessName', 'declaration of simple object is parsed incorrectly');
    });
});


describe("formula-declaration-complex", () => {
    it("should return parsed generic/specific formula", () => {
        let input = `formula AddDelay(DateTime, Delay, HolydaysCallendar):NewDateTime =
    if(Delay.onlyWorking,
    DateTime.AddWorkingDays(Delay.days, HolydaysCallendar),
    DateTime.AddDays(Delay.days)
    )

formula SubtractDelay(DateTime, Delay, HolydaysCallendar):NewDateTime =
    if(Delay.onlyWorking,
    DateTime.AddWorkingDays(-Delay.days, HolydaysCallendar),
    DateTime.AddDays(-Delay.days)
    )

formula AddDelays(DateTime, Delays, HolydaysCallendar):NewDateTime =
    if(Delays.Count() == 0,
    DateTime,
    DateTime.AddDelay(Delays.First(), HolydaysCallendar).AddDelays(Delays.RemoveFirstDelay(), HolydaysCallendar))


formula SubtractDelays(DateTime, Delays, HolydaysCallendar):NewDateTime =
    if(Delays.Count() == 0,
    DateTime,
    DateTime.SubtractDelay(Delays.First(), HolydaysCallendar).SubtractDelays(Delays.RemoveFirstDelay(), HolydaysCallendar))

formula RemoveFirstDelay(Delays):NewDelays = Delays.Where(x => x != Delays.First())

formula AddWorkingDays(DateTime, Integer, HolydaysCallendar):NewDateTime =
    if(HolydaysCallendar[DateTime.Date()],
    DateTime.AddDays(1).AddWorkingDays(Integer, HolydaysCallendar),
    if(Integer > 0, DateTime.AddDays(1).AddWorkingDays(Integer - 1, HolydaysCallendar), DateTime)
    )

formula GetMonthsDifference(EndOn, StartOn):Integer = (EndOn.Year() - StartOn.Year()) * 12 + EndOn.Month() - StartOn.Month()

formula GetDutchMonthName(Integer):String = if(Integer == 1, "januari",
    if(Integer == 2, "februari",
    if(Integer == 3, "maart",
    if(Integer == 4, "april",
    if(Integer == 5, "mei",
    if(Integer == 6, "juni",
    if(Integer == 7, "juli",
    if(Integer == 8, "augustus",
    if(Integer == 9, "september",
    if(Integer == 10, "oktober",
    if(Integer == 11, "november", "december")))))))))))`;

        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor() as BellaDeclarationVisitor;
        visitor.visit(tree);
        let declarations = visitor.declarations;
        expect(declarations).to.have.lengthOf(8);
    });
});
describe("formula-declaration-inline-expression", () => {
    it("should return parsed formula", () => {
        let input = `
formula IsLevelTransitionPossible(DunningProcess, DateTime, Calendar):Boolean =
    !DunningProcess.IsLocked() &&
        DateTime.Date() >= DunningProcess.lastActionDateTime.AddDelays
            (
                DunningProcess.currentDunningLevel.expirationDelays,
                Calendar
            ).Date()`;

        // let tree = BellaLanguageSupport.parseWithErrorListener(input, ThrowingErrorListener.INSTANCE);
        let tree = BellaLanguageSupport.parseWithErrorStrategy(input, new BellaErrorStrategy());
        let visitor = BellaLanguageSupport.generateVisitor() as BellaDeclarationVisitor;
        visitor.visit(tree);
        let declarations = visitor.declarations;
        expect(declarations).to.have.lengthOf(1);
        // let [ d1, d2 ] = declarations as FormulaDeclaration[];
        // expect(d1.name).to.equal('ToProcessName(Flow):ProcessName', 'declaration is parsed incorrectly');
        // expect(d2.name).to.equal('ToProcessName(Order):ProcessName', 'declaration of simple object is parsed incorrectly');
    });
});

