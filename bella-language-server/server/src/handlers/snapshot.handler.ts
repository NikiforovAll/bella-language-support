import { LSPDeclarationRegistry } from '../registry/declaration-registry/lsp-declaration-registry';
import { LSPReferenceRegistry } from '../registry/references-registry/lsp-references-registry';
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path';
import { BaseHandler } from './base.handler';
import { CommonUtils } from '../utils/common.utils';
import { DeclarationType } from 'bella-grammar';

export class SnapshotHandler extends BaseHandler {
    constructor(
        private cache: LSPDeclarationRegistry, private refCache: LSPReferenceRegistry) {
        super();
    }

    //"parser/make-snapshot"
    public makeSnapshot() {
        let declarationRegistry = this.cache;
        fs.mkdtemp(path.join(os.tmpdir(), 'bella-language-server-'), (err, folder) => {
            if (err) throw err;

            let services = declarationRegistry.getDeclarationsForQuery({
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
            })
            fs.writeFile(path.join(folder, "services.json"),
                JSON.stringify(services), (err) => {
                    if (err) throw err;
                    this.connection
                        .console.log(`["parser/make-snapshot"]: Snapshot created at ${folder}`);
                }
            );
        });
    }
}
