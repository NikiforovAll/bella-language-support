export interface BaseDeclaration {
    range: Range
    name: string;
    type: DeclarationType
}

export enum DeclarationType {
    ComponentService,
    Service,
    Procedure,
    Object,
    CompositeObject,
    Enum
}

export interface Range {
    startPosition: Position,
    endPosition: Position
}

export interface Position {
    row: number;
    col: number
}

export enum ObjectBase {
    Alias,
    POCO,
    Collection
}
