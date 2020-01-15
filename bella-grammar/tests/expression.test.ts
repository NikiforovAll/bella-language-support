import { BellaErrorStrategy, BellaLanguageSupport } from "../src/lib/index";

describe("expression-simple-lambda", () => {
    it("should return parsed expression", () => {
        let input = `
TestCollection.Where(i => i.Data.Date() == now)

(EndOn.Year() - StartOn.Year()) * 12 + EndOn.Month() - StartOn.Month()`;

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


describe("expression-mad", () => {
    it("should return parsed expression", () => {
        let input = `
procedure RunDunning(CurrentDateTime) at 21:00 every Day

    ClosedDunningProcesses = new
    InvoiceIds = new

    foreach RootPersistentObject.dunningProcessesHistoryByServiceAccountIdByAccountId.SelectMany(x => x.SelectMany(y => y.activeDunningProcesses)).Where(dp => dp.serviceCategoryId != "Anna")

        if DunningProcess.CanBeStopped()

            call StopDunningProcess(DunningProcess, ClosedOn = CurrentDateTime, out RemovedInvoiceIds)
            call PerformClosureActions(DunningProcess, CurrentDateTime)
            call TryUnlockDunningProcess(DunningProcess)

            ClosedDunningProcesses ++= DunningProcess
            foreach RemovedInvoiceIds
                InvoiceIds ++= InvoiceId

        else if DunningProcess.IsLevelTransitionPossible(CurrentDateTime, RootPersistentObject.calendar) && !DunningProcess.isCurrentDunningLevelLast && !DunningProcess.IsBlocked()

            call MoveToNextDunningLevel(DunningProcess, CurrentDateTime)

    foreach ClosedDunningProcesses //migrating closed dunning processes from active

        call MigrateDunningProcessToClosedState(DunningProcess)

    call RemoveSentToDunningInvoices(RemovedInvoiceIds = InvoiceIds)

formula IsLevelTransitionPossible(DunningProcess, DateTime, Calendar):Boolean =
    !DunningProcess.IsLocked() &&
        DateTime.Date() >= DunningProcess.lastActionDateTime.AddDelays
            (
                DunningProcess.currentDunningLevel.expirationDelays,
                Calendar
            ).Date()`;

        // let tree = BellaLanguageSupport.parseWithErrorStrategy(input, new BellaErrorStrategy());
        let tree = BellaLanguageSupport.parse(input);
        let visitor = BellaLanguageSupport.generateVisitor();
        visitor.visit(tree);
    });
});
