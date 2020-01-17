import { expect } from 'chai';
import { BellaErrorStrategy, BellaLanguageSupport, ProcedureDeclaration, VisitorType, DeclarationType } from '../src/lib';
import { BellaReferenceVisitor } from '../src/lib/bella-reference.visitor';


describe("procedure-references", () => {
    it("should return refs for procedure", () => {
        let input = `
formula ToTransactionInvoiceMatchInformation(InvoiceOverview):TransactionInvoiceMatchInformation = new TransactionInvoiceMatchInformation
    (
        invoiceId = InvoiceOverview.id,
        paymentSize = InvoiceOverview.leftToPay
    )
`;
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor(VisitorType.ReferencesVisitor) as BellaReferenceVisitor;
        visitor.visit(tree);
        let refs = visitor.references.filter(r => r.referenceTo === DeclarationType.Formula && r.isDeclaration);
        expect(refs).to.have.lengthOf(1);
    });
});
