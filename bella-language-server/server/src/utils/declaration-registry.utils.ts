import { DeclarationRegistryNode, KeyedDeclaration, DeclarationKey } from "../lsp-declaration-registry";
import { BaseDeclaration, MemberComposite } from "bella-grammar";
import { Dictionary } from "typescript-collections";
import { CommonUtils } from "./common.utils";

export namespace DeclarationRegistryUtils {
    export function createRegistryNode(declarations: BaseDeclaration[], uri: string): DeclarationRegistryNode {
        let dict = new Dictionary<DeclarationKey, KeyedDeclaration>();
        for (let declaration of declarations) {
            let members = (declaration as MemberComposite).members;
            if (!members) {
                members = [];
            }
            dict.setValue(
                new DeclarationKey(declaration.name, declaration.type),
                { ...declaration, uri }
            );
        }
        let registry = new DeclarationRegistryNode(dict, CommonUtils.getNamespaceFromURI(uri));
        return registry;
    }
}
