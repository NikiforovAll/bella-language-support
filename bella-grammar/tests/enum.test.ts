import {
    BellaLanguageSupport, MemberComposite } from "../src/lib/index";
import { expect, assert } from "chai";
import { EnumDeclaration } from "../src/lib/models/enum-declaration";
describe("enum-declaration", () => {
    it("should return parsed enum", () => {
        let input = `
enum TestEnumName
    One
    Two`;
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor();
        visitor.visit(tree);
        let declarations = visitor.declarations;
        expect(declarations).to.have.lengthOf(1);
        let [ d ] = declarations;
        let declaration = d as EnumDeclaration;
        assert.ok(declaration);
        expect(declaration.members).to.have.lengthOf(2);
        expect(declaration.range.startPosition.row).to.equal(1);
        expect(declaration.range.endPosition.row).to.equal(3);
        let [ee1, ee2] = declaration.members || [];
        expect(ee1.range.startPosition.row).to.equal(2)
        expect(ee2.range.startPosition.row).to.equal(3)
    });
});
