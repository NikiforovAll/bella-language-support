import { expect } from 'chai';
import { BellaLanguageSupport, VisitorType } from '../src/lib';
import { BellaCompletionVisitor } from '../src/lib/bella-completion.visitor';
describe("accessor-expression-completion-simple", () => {
    it("should return parsed nested accessors", () => {
        let input = ` // blank line
BaseObject.PropertyAsObject`;
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor(VisitorType.CompletionVisitor) as BellaCompletionVisitor;
        visitor.visit(tree);
        expect(visitor.triggers).to.have.lengthOf(1);
    });
});
describe("accessor-expression-completion", () => {
    it("should return parsed nested accessors", () => {
        let input = ` // blank line
BaseObject.PropertyAsObject.PrimitiveField`;
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor(VisitorType.CompletionVisitor) as BellaCompletionVisitor;
        visitor.visit(tree);
        expect(visitor.triggers).to.have.lengthOf(2);
    });
});

describe("accessor-expression-with-method-completion", () => {
    it("should return parsed nested accessors", () => {
        let input = ` // blank line
BaseObject.PropertyAsObject.Formula()`;
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor(VisitorType.CompletionVisitor) as BellaCompletionVisitor;
        visitor.visit(tree);
        expect(visitor.triggers).to.have.lengthOf(2);
    });
});

describe("accessor-expression-with-inner-expression-completion", () => {
    it("should return parsed nested accessors", () => {
        let input = ` // blank line
call Test(BaseObject.PropertyAsObject)`;
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor(VisitorType.CompletionVisitor) as BellaCompletionVisitor;
        visitor.visit(tree);
        expect(visitor.triggers).to.have.lengthOf(3);
    });
});
