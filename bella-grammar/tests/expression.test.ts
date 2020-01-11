import { BellaErrorStrategy, BellaLanguageSupport } from "../src/lib/index";

describe("expression-simple-lambda", () => {
    it("should return parsed expression", () => {
        let input = `
TestCollection.Where(i => i.Data.Date() == now)`;

        let tree = BellaLanguageSupport.parseWithErrorStrategy(input, new BellaErrorStrategy());
        let visitor = BellaLanguageSupport.generateVisitor();
        visitor.visit(tree);
    });
});

describe("expression-complex-if-statement", () => {
    it("should return parsed expression", () => {
        let input = `
if ProductCatalogDateFilter.propositionDateField == PropositionDateField.CreatedOn
PropositionFilteredCollection = PropositionCollection.Where(p => p.createdOn.Date() < ProductCatalogDateFilter.targetDate.Date())
else if ProductCatalogDateFilter.propositionDateField == PropositionDateField.StartOn
PropositionFilteredCollection = PropositionCollection.Where(p => p.startOn.Date() < ProductCatalogDateFilter.targetDate.Date())
else if ProductCatalogDateFilter.propositionDateField == PropositionDateField.EndOn
PropositionFilteredCollection = PropositionCollection.Where(p => p.endOn.Date() < ProductCatalogDateFilter.targetDate.Date())`;

        let tree = BellaLanguageSupport.parseWithErrorStrategy(input, new BellaErrorStrategy());
        let visitor = BellaLanguageSupport.generateVisitor();
        visitor.visit(tree);
    });
});


