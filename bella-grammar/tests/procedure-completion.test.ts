import { expect } from 'chai';
import { BellaLanguageSupport, VisitorType } from '../src/lib';
import { BellaCompletionVisitor } from '../src/lib/bella-completion.visitor';

describe("procedure-completion", () => {
    it("should return parsed completion for procedure", () => {
        let input = ` // blank line
procedure Test()
    call  Test()
    call   `;
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor(VisitorType.CompletionVisitor) as BellaCompletionVisitor;
        visitor.visit(tree);
        // expect(visitor.triggers).to.have.lengthOf(2);
        // const expectedRange: Range =  {
        //     startPosition: {row: 2, col: 4},
        //     endPosition: {row: 2, col: 10},
        // }
        // let [ t, ...rest ] = visitor.triggers;
        // expect(t.range).to.eql(expectedRange);
    });
});

