import { LSPDeclarationRegistry, KeyedDeclaration } from '../registry/declaration-registry/lsp-declaration-registry';
import { LSPReferenceRegistry } from '../registry/references-registry/lsp-references-registry';
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path';
import { BaseHandler } from './base.handler';
import { CommonUtils } from '../utils/common.utils';
import { DeclarationType } from 'bella-grammar';
import { promisify } from 'util';
import _ = require('lodash');
import { LocatedBellaReference } from '../utils/reference-registry.utils';

let mkdtemp = promisify(fs.mkdtemp);
let writeFile = promisify(fs.writeFile);

export class SnapshotHandler extends BaseHandler {

    private folder?: string;
    private keys?: string[];

    constructor(
        private cache: LSPDeclarationRegistry, private refCache: LSPReferenceRegistry) {
        super();
    }

    //"parser/make-snapshot"
    public makeSnapshot() {
        mkdtemp(path.join(os.tmpdir(), 'bella-language-server-'))
            .then((folder) => {
                this.folder = folder;
                return Promise.all([
                    // TODO: consider factor out this methods and configure via TS Decorators
                    // e.g. @Exporter("target.json")
                    this.exportHostedServices(),
                    this.exportServiceReference(),
                    this.exportProcedures(),
                    this.exportReferences(),
                    this.exportObjects()
                ]);
            })
            .then(() => {
                this.connection.console.info(`["parser/make-snapshot"]: Snapshot created at ${this.folder}`);
            })
            .catch((err) => {
                this.connection.console.info(`["parser/make-snapshot"]: Parsing failed ${err}`);
            });
    }

    private exportHostedServices(): Promise<void> {
        if (!this.folder) {
            throw "Can't export, folder is not set"
        }
        let declarationRegistry = this.cache;
        let declarations = declarationRegistry.getDeclarationsForQuery({
            uriFilter: {
                active: false
            },
            namespaceFilter: {
                active: false,
                namespace: CommonUtils.SHARED_NAMESPACE_NAME
            },
            typeFilter: {
                active: true,
                type: DeclarationType.ComponentService
            }
        });
        const destPath = path.join(this.folder, "hosted-services.json");
        return writeFile(destPath, JSON.stringify(declarations, null, 2));
    }

    private exportServiceReference() {
        if (!this.folder) {
            throw "Can't export, folder is not set"
        }
        let declarationRegistry = this.cache;
        let declarations = declarationRegistry.getDeclarationsForQuery({
            uriFilter: {
                active: false
            },
            namespaceFilter: {
                active: false,
                namespace: CommonUtils.SHARED_NAMESPACE_NAME
            },
            typeFilter: {
                active: true,
                type: DeclarationType.Service
            },
            descendantsFilter: {
                active: true
            }
        });
        const result = this.groupDeclarationByScope(declarations);
        const destPath = path.join(this.folder, "service-reference.json");
        return writeFile(destPath, JSON.stringify(result, null, 2));
    }

    private exportProcedures() {
        if (!this.folder) {
            throw "Can't export, folder is not set"
        }
        let declarationRegistry = this.cache;
        let declarations = declarationRegistry.getDeclarationsForQuery({
            uriFilter: {
                active: false
            },
            typeFilter: {
                active: true,
                type: DeclarationType.Procedure
            },
            descendantsFilter: {
                active: true
            }
        });
        const result = this.groupDeclarationByScope(declarations);
        const destPath = path.join(this.folder, "procedures.json");
        return writeFile(destPath, JSON.stringify(result, null, 2));
    }

    private exportReferences() {
        if (!this.folder) {
            throw "Can't export, folder is not set"
        }
        let referenceRegistry = this.refCache;
        let refs = referenceRegistry.getReferencesForQuery({
            uriFilter: { active: false },
            typeFilter: { active: false, type: DeclarationType.Procedure },
            nameFilter: { active: false, name: '' },
            namespaceFilter: { active: false, namespace: '' }
        });
        const result = this.groupReferencesByScope(refs);
        const destPath = path.join(this.folder, "references.json");
        return writeFile(destPath, JSON.stringify(result, null, 2));
    }

    private exportObjects() {
        if (!this.folder) {
            throw "Can't export, folder is not set"
        }
        let declarationRegistry = this.cache;
        let declarations = declarationRegistry.getDeclarationsForQuery({
            uriFilter: {
                active: false
            },
            namespaceFilter: {
                active: false,
                namespace: CommonUtils.SHARED_NAMESPACE_NAME
            },
            typeFilter: {
                active: true,
                type: DeclarationType.Object
            },
            descendantsFilter: {
                active: true
            }
        });
        let persistentObjects = declarationRegistry.getDeclarationsForQuery({
            uriFilter: {
                active: false
            },
            namespaceFilter: {
                active: false,
                namespace: CommonUtils.SHARED_NAMESPACE_NAME
            },
            typeFilter: {
                active: true,
                type: DeclarationType.PersistentObject
            },
            descendantsFilter: {
                active: true
            }
        });

        let enums = declarationRegistry.getDeclarationsForQuery({
            uriFilter: {
                active: false
            },
            namespaceFilter: {
                active: false,
                namespace: CommonUtils.SHARED_NAMESPACE_NAME
            },
            typeFilter: {
                active: true,
                type: DeclarationType.Enum
            },
            descendantsFilter: {
                active: false
            }
        });
        const result = this.groupDeclarationByScope([...declarations, ...persistentObjects, ...enums]);
        const destPath = path.join(this.folder, "objects.json");
        return writeFile(destPath, JSON.stringify(result, null, 2));
    }

    /**
     * returns scope for a given uri: common, system, componentName
     * @param uri - uri to be parsed
     */
    private getScope(uri: string) {
        if (_.isNil(this.keys)) {
            this.keys = this.cache.getKeys();
        }
        let namespace = CommonUtils.getNamespaceFromURI(uri);
        let componentName = namespace === CommonUtils.SHARED_NAMESPACE_NAME
            ? CommonUtils.extractComponentNameFromUrl(uri, this.keys)
            : namespace;
        return componentName;
    }

    private groupDeclarationByScope(decs: KeyedDeclaration[]): NamespacedDeclarations[] {
        const groupedDeclarations: _.Dictionary<KeyedDeclaration[]> =
            _.groupBy(decs, ((kd: KeyedDeclaration) => this.getScope(kd.uri)))
        const declarations: NamespacedDeclarations[] = _.map(groupedDeclarations, (group, key) => ({
            namespace: key,
            declarations: group
        }))
        return declarations;
    }

    private groupReferencesByScope(refs: LocatedBellaReference[]) {
        const groupedDeclarations = _.groupBy(refs, ((kd: LocatedBellaReference) => this.getScope(kd.uri)))
        const references: NamespacedReferences[] = _.map(groupedDeclarations, (group, key) => ({
            namespace: key,
            references: group
        }))
        return references;
    }
}

interface NamespacedDeclarations {
    namespace: string;
    declarations: KeyedDeclaration[]
}

interface NamespacedReferences {
    namespace: string;
    references: LocatedBellaReference[]
}
