import { DeclarationType } from "./declaration-type.enum";
import { BaseDeclaration, Range } from "./base-declaration";

export interface BellaCompletionTrigger {
    completionBase: DeclarationIdentifier;
    expectedCompletions: DeclarationType[];
    range: Range;
}

export interface DeclarationIdentifier extends SimpleDeclarationIdentifier, CompoundDeclarationIdentifier {
    context: string;
}

export interface SimpleDeclarationIdentifier {
    completionSource?: CompletionIdentifier[];
}
export interface CompoundDeclarationIdentifier {
    compoundCompletionSource?: BellaCompletionTrigger[];
}

export interface CompletionIdentifier {
    name: string;
    type: DeclarationType;
}
