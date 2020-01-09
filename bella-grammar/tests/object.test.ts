import {
    BellaLanguageSupport,
    SimpleObjectDeclaration,
    CompositeObjectDeclaration,
    ObjectBase } from "../src/lib/index";
import { expect, assert } from "chai";
describe("object-declaration", () => {
    it("should return parsed alias", () => {
        let input = "object Test:String";
        let tree = BellaLanguageSupport.generateTree(input);
        let visitor = BellaLanguageSupport.generateVisitor();
        visitor.visit(tree);
        let declarations = visitor.declarations;
        expect(declarations).to.have.lengthOf(1);
        let [ d ] = declarations;
        let declaration = d as SimpleObjectDeclaration;
        assert.ok(declaration);
        expect(declaration.name).to.equal('Test', 'name of simple object is parsed incorrectly');
        expect(declaration.objectBase).to.equal(ObjectBase.Alias);
    });
});

describe("object-declaration-composite", () => {
    it("should return parsed composite object", () => {
        let input = `//skipped line
object TestName
    id:String
    category:CustomCategoryType
    dates:DateTime[*]
`;
        let tree = BellaLanguageSupport.generateTree(input);
        let visitor = BellaLanguageSupport.generateVisitor();
        visitor.visit(tree);
        let declarations = visitor.declarations;
        expect(declarations).to.have.lengthOf(1);
        let [ d ] = declarations;
        let declaration = d as CompositeObjectDeclaration;
        assert.ok(declaration);
        expect(declaration.name).to.equal('TestName', 'name of simple object is parsed incorrectly');
        expect(declaration.objectBase).to.equal(ObjectBase.Composite);
        expect(declaration.range.endPosition.row).to.equal(4);
        expect(declaration.fields).to.have.lengthOf(3);
        let [f1, f2, f3] = declaration.fields;
        expect(f1.returnType).to.have.property('objectBase', ObjectBase.PrimitiveType);
        expect(f2.returnType).to.have.property('objectBase', ObjectBase.Alias);
        expect(f3.returnType).to.have.property('objectBase', ObjectBase.Collection);
    });
});

