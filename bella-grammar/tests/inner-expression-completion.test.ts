import { expect } from 'chai';
import { BellaLanguageSupport, VisitorType } from '../src/lib';
import { BellaCompletionVisitor } from '../src/lib/bella-completion.visitor';
describe("inner-expression-new-statement", () => {
    it("should return parsed nested completions", () => {
        let input = ` // blank line
new Account(
    Name = new Name()
)`;
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor(VisitorType.CompletionVisitor) as BellaCompletionVisitor;
        visitor.visit(tree);
        expect(visitor.triggers).to.have.lengthOf(2);
    });
});

describe("inner-expression-local-variable-statement", () => {
    it("should return parsed nested completions", () => {
        let input = ` // blank line
        let t = TestService.Formula(TestObject.)
        `;
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor(VisitorType.CompletionVisitor) as BellaCompletionVisitor;
        visitor.visit(tree);
        expect(visitor.triggers).to.have.lengthOf(1);
    });
});
