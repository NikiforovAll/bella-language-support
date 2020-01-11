import { BellaLanguageSupport, ProcedureDeclaration, FormulaDeclaration } from "../src/lib/index";
import { expect, assert } from "chai";
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
        let visitor = BellaLanguageSupport.generateVisitor();
        visitor.visit(tree);
        let declarations = visitor.declarations;
        expect(declarations).to.have.lengthOf(1);
        let [ declaration ] = declarations as FormulaDeclaration[];
        expect(declaration.name).to.equal('ToProcessType(Flow):ProcessType', 'name of simple object is parsed incorrectly');
    });
});


describe("procedure-declaration-generic-specific", () => {
    it("should return parsed generic/specific formula", () => {
        let input = `
generic formula ToProcessName(Flow):ProcessName = empty

specific formula ToProcessName(Order):ProcessName = if(Order.type == OrderType.New,"New contract","Order prolongation")`;

        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor();
        visitor.visit(tree);
        let declarations = visitor.declarations;
        expect(declarations).to.have.lengthOf(2);
        let [ d1, d2 ] = declarations as FormulaDeclaration[];
        expect(d1.name).to.equal('ToProcessName(Flow):ProcessName', 'declaration is parsed incorrectly');
        expect(d2.name).to.equal('ToProcessName(Order):ProcessName', 'declaration of simple object is parsed incorrectly');
    });
});


