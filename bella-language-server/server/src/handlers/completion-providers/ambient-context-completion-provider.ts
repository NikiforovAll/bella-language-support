import { CompletionItem } from 'vscode-languageserver';
import { CompletionProvider, BaseCompletionProvider } from './general-purpose-providers/completion-provider';
import { KeyedDeclaration, LSPDeclarationRegistry } from '../../registry/declaration-registry/lsp-declaration-registry';
import { CachedCompletionProvider } from './general-purpose-providers/cached-completion-provider';
import { NodeRegistrySearchQuery } from '../../registry/declaration-registry/declaration-registry-query';
import { CommonUtils } from '../../utils/common.utils';
import { DeclarationType } from 'bella-grammar';
import { Dictionary } from "typescript-collections";
import { ObjectCompletionProvider } from './object-completion-provider';
import { PersistentObjectCompletionProvider } from './persistent-object-completion-provider';
import { EnumCompletionProvider } from './enum-completion-provider';
import { ServiceCompletionProvider } from './service-completion-provider';


export class AmbientContextCompletionProvider extends CachedCompletionProvider {
    toCompletionItem(declaration: KeyedDeclaration): CompletionItem {
        throw new Error("Method not implemented.");
    }

    providersMap: Dictionary<DeclarationType, BaseCompletionProvider> = new Dictionary<DeclarationType, BaseCompletionProvider>();

    getCompletions(): CompletionItem[] {
        const result: CompletionItem[] = [];
        //get cached version
        const declarations = this.getSourceDeclarations();
        for (const declaration of declarations) {
            if(this.providersMap.containsKey(declaration.type)) {
                const completion = this.providersMap
                    .getValue(declaration.type)?.toCompletionItem(declaration);
                if(!completion) {
                    continue;
                }
                result.push(completion);
            }
        }
        return result;
    }

    constructor(cache: LSPDeclarationRegistry, docUri: string) {
        super(cache, docUri, {
            uriFilter: { active: false },
            namespaceFilter: {
                active: true,
                namespace: CommonUtils.getNamespaceFromURI(docUri),
                // componentName: CommonUtils.getNamespaceFromURI(docUri),
                // excludeCommon: false,
            }
        });
        [
            { type: DeclarationType.Object, provider: new ObjectCompletionProvider(this.cache, this.docUri) },
            { type: DeclarationType.PersistentObject, provider: new PersistentObjectCompletionProvider(this.cache, this.docUri) },
            { type: DeclarationType.Enum, provider: new EnumCompletionProvider(this.cache, this.docUri) },
            //this one will be scoped by component name
            { type: DeclarationType.ComponentService, provider: new ServiceCompletionProvider(this.cache, this.docUri) },
        ].forEach(t2p => this.providersMap.setValue(t2p.type, t2p.provider))
    }
}
