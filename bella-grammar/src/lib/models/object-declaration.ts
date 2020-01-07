import { BaseDeclaration, ObjectBase } from "./base-declaration";

export interface SimpleObjectDeclaration extends BaseDeclaration {
    objectBase: ObjectBase
    //TODO: add information about declared type
}

export interface CompositeObjectDeclaration extends SimpleObjectDeclaration {
    fields: SimpleObjectDeclaration[]
}
