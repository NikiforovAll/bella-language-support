import { expect } from 'chai';

import { BellaLanguageSupport, VisitorType } from '../src/lib';
import { BellaScopeVisitor } from '../src/lib/bella-scope.visitor';

describe("scope-simple", () => {
    it("should return parsed scopes", () => {
        let input = ` // blank line
procedure Test1()
    DoNothing()
procedure Test2()
    DoNothing()
                `;

        let visitor = BellaLanguageSupport.generateVisitor(VisitorType.ScopeVisitor) as BellaScopeVisitor;
        visitor.visit(input);
        expect(visitor.scopes).to.have.lengthOf(2);
    });
});
