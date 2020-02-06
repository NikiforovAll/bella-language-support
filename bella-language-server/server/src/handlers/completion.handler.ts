import { DeclarationType, BellaCompletionTrigger} from 'bella-grammar';
import { DeclarationIdentifier } from 'bella-grammar/dist/lib/models/bella-completion';
import { CompletionItem, CompletionItemKind, CompletionParams } from 'vscode-languageserver';

import { LSPCompletionRegistry } from '../registry/completion-registry.ts/lsp-completion-registry';
import { KeyedDeclaration, LSPDeclarationRegistry } from '../registry/declaration-registry/lsp-declaration-registry';
import { CommonUtils } from '../utils/common.utils';
import { BaseHandler } from './base.handler';


export class CompletionHandler extends BaseHandler {
    docUri: string;
    constructor(
        private cache: LSPDeclarationRegistry,
        private completions: LSPCompletionRegistry) {
        super();
        this.docUri = '';
    }

    public complete(params: CompletionParams): CompletionItem[] {
        this.docUri = params.textDocument.uri;
        let completionToken = this.completions.getCompletion(
            params.position.line,
            params.position.character,
            this.docUri
        );

        let providers = [];
        if (!completionToken) {
            providers = [
                new KeywordCompletionProvider(),
                this.createProvider(DeclarationType.PersistentObject),
                this.createProvider(DeclarationType.Object)
            ]
        } else {
            providers = this.createProviders(completionToken);
        }
        return new MultipleSourceCompletionProvider(...providers).getCompletions();
    }

    private createProviders(context: BellaCompletionTrigger): CompletionProvider[] {
        return context.expectedCompletions.map(t => this.createProvider(t, context));
    }

    private createProvider(expectedCompletionType: DeclarationType, context?: BellaCompletionTrigger,
        ): CompletionProvider {
        switch (expectedCompletionType) {
            case DeclarationType.Procedure:
                return new ProcedureCompletionProvider(this.cache, this.docUri);
                break;
            case DeclarationType.Object:
                return new ObjectCompletionProvider(this.cache, this.docUri);
            case DeclarationType.PersistentObject:
                return new PersistentObjectCompletionProvider(this.cache, this.docUri);
            case DeclarationType.ObjectField:
                const completionSource = context?.completionBase?.completionSource?.pop();
                const completionSourceName = completionSource?.name;
                if(!completionSourceName || completionSource?.type !== DeclarationType.Object){
                    throw new Error('Completion source could not be resolved, please provide correct one');
                }
                return new ObjectFieldCompletionProvider(this.cache, this.docUri, completionSourceName);
            default:
                throw new Error('Completion provider could not be resolved');
                break;
        }
    }
}

interface CompletionProvider {
    getCompletions(): CompletionItem[];
}

class MultipleSourceCompletionProvider implements CompletionProvider {
    getCompletions(): CompletionItem[] {
        return this.providers
            .map(p => p.getCompletions())
            .reduce((acc, completion) => acc.concat(completion));
    }

    providers: CompletionProvider[];
    constructor(...providers: CompletionProvider[]) {
        this.providers = providers;
    }
}

class KeywordCompletionProvider implements CompletionProvider {
    getCompletions(): CompletionItem[] {
        return [
            {
                label: 'new',
                insertText: 'new ',
                kind: CompletionItemKind.Keyword
            },
            {
                label: 'call',
                insertText: 'call ',
                kind: CompletionItemKind.Keyword
            },
            {
                label: 'let',
                insertText: 'let ',
                kind: CompletionItemKind.Keyword
            },
        ];
    }
}



class PersistentObjectCompletionProvider implements CompletionProvider {

    constructor(private cache: LSPDeclarationRegistry, private docUri: string) { }

    getCompletions(): CompletionItem[] {
        const declarations = this.cache.getDeclarationsForQuery(
            {
                uriFilter: { active: false },
                typeFilter: {
                    active: true,
                    type: DeclarationType.PersistentObject
                },
                namespaceFilter: {
                    active: true,
                    namespace: CommonUtils.getNamespaceFromURI(this.docUri),
                }
            }
        );
        return declarations.map(this.toCompletionItem);
    }

    private toCompletionItem(declaration: KeyedDeclaration): CompletionItem {
        return {
            label: declaration.name,
            detail: CommonUtils.getDeclarationFullRelativePath(declaration.uri),
            // detail: 'test',
            kind: CompletionItemKind.Variable
        }
    }
}


class ProcedureCompletionProvider implements CompletionProvider {

    constructor(private cache: LSPDeclarationRegistry, private docUri: string) { }

    getCompletions(): CompletionItem[] {
        const declarations = this.cache.getDeclarationsForQuery(
            {
                uriFilter: { active: false },
                typeFilter: {
                    active: true,
                    type: DeclarationType.Procedure
                },
                namespaceFilter: {
                    active: true,
                    namespace: CommonUtils.getNamespaceFromURI(this.docUri),
                    // componentName: CommonUtils.extractComponentNameFromUrl(this.docUri)
                }
            }
        );
        return declarations.map(this.toCompletionItem);
    }

    private toCompletionItem(declaration: KeyedDeclaration): CompletionItem {
        return {
            label: CommonUtils.getProcedureTruncatedName(declaration.name),
            detail: CommonUtils.getDeclarationFullRelativePath(declaration.uri),
            // detail: 'test',
            kind: CompletionItemKind.Method
        }
    }
}

class ObjectCompletionProvider implements CompletionProvider {

    constructor(private cache: LSPDeclarationRegistry, private docUri: string) { }

    getCompletions(): CompletionItem[] {
        const declarations = this.cache.getDeclarationsForQuery(
            {
                uriFilter: { active: false },
                typeFilter: {
                    active: true,
                    type: DeclarationType.Object
                },
                namespaceFilter: {
                    active: true,
                    namespace: CommonUtils.getNamespaceFromURI(this.docUri),
                }
            }
        );
        return declarations.map(this.toCompletionItem);
    }

    private toCompletionItem(declaration: KeyedDeclaration): CompletionItem {
        return {
            label: declaration.name,
            detail: CommonUtils.getDeclarationFullRelativePath(declaration.uri),
            kind: CompletionItemKind.Class,
        }
    }
}


class ObjectFieldCompletionProvider implements CompletionProvider {

    constructor(
        private cache: LSPDeclarationRegistry,
        private docUri: string,
        private objectName: string) { }

    getCompletions(): CompletionItem[] {
        const declarations = this.cache.getDeclarationsForQuery(
            {
                uriFilter: { active: false },
                nameFilter: {
                    active: true,
                    name: this.objectName
                },
                typeFilter: {
                    active: true,
                    type: DeclarationType.Object
                },
                namespaceFilter: {
                    active: true,
                    namespace: CommonUtils.getNamespaceFromURI(this.docUri),
                },
                descendantsFilter: {
                    active: true,
                    discardParent: true
                }
            }
        );
        return declarations.map(this.toCompletionItem);
    }

    private toCompletionItem(declaration: KeyedDeclaration): CompletionItem {
        const objectFieldName = declaration.name;
        const sortingPrefix = '0';
        return {
            label: objectFieldName,
            detail: CommonUtils.getDeclarationFullRelativePath(declaration.uri),
            kind: CompletionItemKind.Property,
            sortText: sortingPrefix + objectFieldName
        }
    }
}
