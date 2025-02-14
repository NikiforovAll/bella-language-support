import {
    BellaLanguageSupport,
    SimpleObjectDeclaration,
    CompositeObjectDeclaration,
    ObjectBase,
    ThrowingErrorListener,
    DeclarationType} from "../src/lib/index";
import { expect, assert } from "chai";
import { BellaDeclarationVisitor } from "../src/lib/bella-declaration.visitor";
describe("object-declaration", () => {
    it("should return parsed alias", () => {
        let input = "object Test:String";
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor() as BellaDeclarationVisitor;
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

describe("object-declaration", () => {
    it("should return parsed alias", () => {
        let input = "object TestList:Test[*]";
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor() as BellaDeclarationVisitor;
        visitor.visit(tree);
        let declarations = visitor.declarations;
        expect(declarations).to.have.lengthOf(1);
        let [ d ] = declarations;
        let declaration = d as SimpleObjectDeclaration;
        assert.ok(declaration);
    });
});

describe("object-declaration-composite", () => {
    it("should return parsed composite object", () => {
        let input = `//skipped line
object TestName
    id:String
    category:CustomCategoryType
    dates:DateTime[*]`;
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor() as BellaDeclarationVisitor;
        visitor.visit(tree);
        let declarations = visitor.declarations;
        expect(declarations).to.have.lengthOf(1);
        let [ d ] = declarations;
        let declaration = d as CompositeObjectDeclaration;
        assert.ok(declaration);
        expect(declaration.name).to.equal('TestName', 'name of simple object is parsed incorrectly');
        expect(declaration.objectBase).to.equal(ObjectBase.Composite);
        expect(declaration.range.endPosition.row).to.equal(4);
        expect(declaration.members).to.have.lengthOf(3);
        let [f1, f2, f3] = declaration.members as SimpleObjectDeclaration[];
        expect(f1.returnType).to.have.property('objectBase', ObjectBase.PrimitiveType);
        expect(f2.returnType).to.have.property('objectBase', ObjectBase.Alias);
        expect(f3.returnType).to.have.property('objectBase', ObjectBase.Collection);
    });
});

//TODO: Test

describe("object-declaration-composite-with-expression", () => {
    it("should return parsed composite object", () => {
        let input = `//skipped line
object Account
    id:AccountId
    fullName:FullName = firstName ++= 3   (if (IsEmpty(prefix, test), " ", (" " + prefix + " "))) + lastName
    lastName:LastName`;
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor() as BellaDeclarationVisitor;
        visitor.visit(tree);
        let declarations = visitor.declarations;
        expect(declarations).to.have.lengthOf(1);
        let [ d ] = declarations;
        let declaration = d as CompositeObjectDeclaration;
        assert.ok(declaration);
        expect(declaration.name).to.equal('Account', 'name of simple object is parsed incorrectly');
        expect(declaration.objectBase).to.equal(ObjectBase.Composite);
        expect(declaration.range.endPosition.row).to.equal(4);
        expect(declaration.members).to.have.lengthOf(3);
        let [f1, f2, f3] = declaration.members as SimpleObjectDeclaration[];
        expect(f1.returnType).to.have.property('objectBase', ObjectBase.Alias);
        expect(f2.returnType).to.have.property('objectBase', ObjectBase.Alias);
        expect(f3.returnType).to.have.property('objectBase', ObjectBase.Alias);
    });
});

describe("object-declaration-composite-with-multi-line-expression", () => {
    it("should return parsed composite object", () => {
        let input = `
object Test
    getNextDunningLevel():DunningLevel = if(dunningProcessTemplate.dunningLevelByOrder.ContainsKey(currentDunningLevel.order + 1),
            dunningProcessTemplate.dunningLevelByOrder[currentDunningLevel.order + 1],
            empty)`;
        let tree = BellaLanguageSupport.parseWithErrorListener(input, ThrowingErrorListener.INSTANCE);
        let visitor = BellaLanguageSupport.generateVisitor() as BellaDeclarationVisitor;
        visitor.visit(tree);
        let declarations = visitor.declarations;
        expect(declarations).to.have.lengthOf(1);
    });
});

describe("persistent-object-declaration", () => {
    it("should return parsed persistent object", () => {
        let input = "persistent object Test:String";
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor() as BellaDeclarationVisitor;
        visitor.visit(tree);
        let declarations = visitor.declarations;
        expect(declarations).to.have.lengthOf(1);
        let [ d ] = declarations;
        let declaration = d as SimpleObjectDeclaration;
        assert.ok(declaration);
        // expect(declaration.objectBase).to.equal(ObjectBase.);
        expect(declaration.type).to.equal(DeclarationType.PersistentObject);
    });
});

