import { DeclarationType } from './declaration-type.enum';

export interface BaseDeclaration {
    range: Range
    name: string;
    type: DeclarationType
}

export interface Range {
    startPosition: Position,
    endPosition: Position
}

export interface Position {
    row: number;
    col: number
}

export interface MemberComposite {
    members?: BaseDeclaration [];
}

export interface SignatureDeclaration {
    signatureContext: SignatureContext;
}
export interface SignatureContext {
    context: string;
    params: ParamDeclaration[];
}
export interface ParamDeclaration {
    alias?: string;
    type: string;
}
