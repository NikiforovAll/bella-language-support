import { BellaLanguageSupport, VisitorType } from "../src/lib/index";
import { expect } from "chai";
import { CompletionVisitor } from "../src/lib/completion.visitor";
import { Range } from "../src/lib/models/base-declaration";
describe("procedure-completion", () => {
    it("should return parsed completion for procedure", () => {
        let input = ` // blank line
procedure Test()
    call  `;
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor(VisitorType.CompletionVisitor) as CompletionVisitor;
        visitor.visit(tree);
        expect(visitor.triggers).to.have.lengthOf(1);
        const expectedRange: Range =  {
            startPosition: {row: 2, col: 4},
            endPosition: {row: 2, col: 10},
        }
        let [ t ] = visitor.triggers;
        expect(t.range).to.eql(expectedRange);

    });
});

