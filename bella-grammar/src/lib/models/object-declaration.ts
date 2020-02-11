import { BaseDeclaration, MemberComposite } from './base-declaration';
import { TypeDeclaration } from './type-declaration';
import { ObjectBase } from './object-base.enum';

export interface BaseObject extends BaseDeclaration {
    objectBase: ObjectBase
}
export interface SimpleObjectDeclaration extends BaseObject {
    returnType?: TypeDeclaration
    //TODO: add information about declared type
}

export interface CompositeObjectDeclaration extends BaseObject, MemberComposite {
    returnType?: TypeDeclaration
}
