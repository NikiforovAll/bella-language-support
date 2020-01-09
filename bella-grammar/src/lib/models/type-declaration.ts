import { BaseDeclaration } from "./base-declaration";
import { ObjectBase } from "./object-base.enum";
export interface TypeDeclaration extends BaseDeclaration {
    objectBase: ObjectBase,
    fullQualifier: string
}
