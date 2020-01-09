import { BaseDeclaration } from "./base-declaration";

export interface EnumDeclaration extends BaseDeclaration {
    enumEntries: BaseDeclaration[]
}
