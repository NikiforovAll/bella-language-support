import { DeclarationType } from "./declaration-type.enum";
import { BaseDeclaration, Range } from "./base-declaration";

export interface BellaCompletionTrigger {
    completionBase: DeclarationIdentifier;
    expectedCompletions: DeclarationType[];
    range: Range;
}

export interface DeclarationIdentifier {
    context: string;
    completionSource?: CompletionIdentifier[]
}

export interface CompletionIdentifier {
    name: string;
    type: DeclarationType;
}
