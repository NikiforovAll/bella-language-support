import { expect } from 'chai';

import { BellaLanguageSupport, DeclarationType, VisitorType } from '../src/lib';
import { BellaReferenceVisitor } from '../src/lib/bella-reference.visitor';


describe("invocation-statement-references", () => {
    it("should return refs to service and external method", () => {
        let input = `
procedure TryStartDunning(InvoiceProcessingRequest, CurrentDateTime)
    IncomingInvoiceOverview = InvoiceProcessingRequest.invoiceOverview
    ServiceAccountId = InvoiceProcessingRequest.serviceAccountId

    if InvoiceProcessingRequest.IsFirstInvoiceRejectionForNotActivatedServiceAccount()
        InvoiceGeneratorAsync.RemoveSentToDunningInvoiceByInvoiceId(IncomingInvoiceOverview.id)
        return
`;
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor(VisitorType.ReferencesVisitor) as BellaReferenceVisitor;
        visitor.visit(tree);
        let refs2 = visitor.references.filter(r => r.referenceTo === DeclarationType.Service);
        expect(refs2).to.have.lengthOf(1);
        // let refs = visitor.references.filter(r => r.referenceTo === DeclarationType.Procedure && !r.isDeclaration);
        // expect(refs).to.have.lengthOf(1);
    });
});

describe("invocation-statement-references-with-return-value", () => {
    it("should return refs to service and external method", () => {
        let input = `
procedure CrmPortalGetPagedSearchForCustomerAccounts(PageNumber, PerPage, CustomerAccountSearchRequest, out PagedSearchResultResponse)
    PagedSearchResultResponse = CrmBackend.GetPagedSearchForCustomerAccounts(PageNumber, PerPage, CustomerAccountSearchRequest)
`;
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor(VisitorType.ReferencesVisitor) as BellaReferenceVisitor;
        visitor.visit(tree);
        let refs2 = visitor.references.filter(r => r.referenceTo === DeclarationType.Service);
        expect(refs2).to.have.lengthOf(1);
        // let refs = visitor.references.filter(r => r.referenceTo === DeclarationType.Procedure && !r.isDeclaration);
        // expect(refs).to.have.lengthOf(1);
    });
});

describe("invocation-statement-references-complex", () => {
    it("should return refs to service and external method", () => {
        let input = `
procedure CrmPortalGetServiceAccountDetails(AccountId, ServiceAccountId, out ServiceAccountDetailsDto)
    AsyncService.DoSomethingAndForget(AccountId = AccountId, ServiceAccountId = ServiceAccountId)
    CustomerAccount = CrmBackend.GetCustomerAccountById(AccountId)
    ServiceAccountDetailsDto = ServiceAccount.ToServiceAccountDetailsDto() //example of formula ambiguity with procedure
`;
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor(VisitorType.ReferencesVisitor) as BellaReferenceVisitor;
        visitor.visit(tree);
        let refs2 = visitor.references.filter(r => r.referenceTo === DeclarationType.Service);
        expect(refs2).to.have.lengthOf(3);
        // let refs = visitor.references.filter(r => r.referenceTo === DeclarationType.Procedure && !r.isDeclaration);
        // expect(refs).to.have.lengthOf(3);
    });
});

describe("invocation-statement-references-complex", () => {
    it("should return refs to service and external method", () => {
        let input = `
procedure ExampleMethod(Test1)
    LogInfo(123)
    TestDataHolder ++= UniqueService.DoSomethingUnique2()
`;
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor(VisitorType.ReferencesVisitor) as BellaReferenceVisitor;
        visitor.visit(tree);
        let refs2 = visitor.references.filter(r => r.referenceTo === DeclarationType.Service);
        expect(refs2).to.have.lengthOf(1);
    });
});

