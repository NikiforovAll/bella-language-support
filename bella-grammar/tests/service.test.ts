import {
    BellaLanguageSupport,
    ObjectBase,
    ServiceDeclaration} from "../src/lib/index";
import { expect, assert } from "chai";
describe("service-declaration", () => {
    it("should return parsed service", () => {
        let input = `
service TestService
    MethodWithNamedParams(gle: GlEvent, scd: SourceCreationDate) oneway
    MethodWithInferredParam(GlAccount) oneway
    MethodWithArrayInReturn(Date, GlEventType, SourceId): GlEvent[*]
    MethodWithDictionaryInReturn(Date, GlEventType, SourceId):GlEvents[Test]
    MethodWithNothing()`;

        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor();
        visitor.visit(tree);
        let declarations = visitor.declarations;
        expect(declarations).to.have.lengthOf(1);
        let declaration  = declarations[0] as ServiceDeclaration;
        expect(declaration.members).to.have.lengthOf(5);
    });
});
