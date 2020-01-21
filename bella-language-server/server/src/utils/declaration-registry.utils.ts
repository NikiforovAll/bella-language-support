import { KeyedDeclaration, DeclarationKey, DeclarationOverload } from "../registry/declaration-registry/lsp-declaration-registry";
import { BaseDeclaration, MemberComposite } from "bella-grammar";
import { Dictionary } from "typescript-collections";
import { CommonUtils } from "./common.utils";
import { countBy, transform } from "lodash";
import { DeclarationRegistryNode } from "../registry/declaration-registry/declaration-registry-node";

export namespace DeclarationRegistryUtils {
    export function createRegistryNode(declarations: BaseDeclaration[], uri: string): DeclarationRegistryNode {
        let dict = new Dictionary<DeclarationKey, KeyedDeclaration>();
        for (let declaration of declarations) {
            let members = (declaration as MemberComposite).members;
            if (!members) {
                members = [];
            }
            //TODO: this contains potential error, overloads are not supported by DeclarationKey
            dict.setValue(
                new DeclarationKey(declaration.name, declaration.type),
                toKeyedDeclaration(declaration, uri)
            );
        }

        let overloadKeys = getNonUniqueDeclarations(declarations);
        let overloads: DeclarationOverload[] = overloadKeys.map((overloadKey) => {
            let result = {
                declarationKey: overloadKey,
                overloads: declarations
                    .filter(d => declarationKeyComparison(d) === overloadKey.toString())
                    .map(d => toKeyedDeclaration(d, uri))
            };
            return result;
        });
        let namespace = CommonUtils.getNamespaceFromURI(uri);
        let componentName = namespace === CommonUtils.SHARED_NAMESPACE_NAME ? CommonUtils.extractComponentNameFromUrl(uri) : namespace
        let registry = new DeclarationRegistryNode(dict,namespace, componentName);
        registry.setOverloads(overloads);
        return registry;
    }

    function getNonUniqueDeclarations(declarations: BaseDeclaration[]): DeclarationKey[] {
        return transform(countBy(declarations, declarationKeyComparison)
            , function (result: DeclarationKey[], count: number, value: string) {
                if (count > 1) {
                    result.push(DeclarationKey.FromString(value));
                }
            }, []);
    }

    function declarationKeyComparison(d: BaseDeclaration) {
        return `${new DeclarationKey(d.name, d.type).toString()}`;
    }

    function toKeyedDeclaration(declaration: BaseDeclaration, uri: string): KeyedDeclaration {
        return { ...declaration, uri };
    }
}
