import { LSPDeclarationRegistry } from '../registry/declaration-registry/lsp-declaration-registry';
import { LSPReferenceRegistry } from '../registry/references-registry/lsp-references-registry';
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path';
import { BaseHandler } from './base.handler';

export class SnapshotHandler  extends BaseHandler{
    constructor(
        private cache: LSPDeclarationRegistry, private refCache: LSPReferenceRegistry) {
        super();
    }

    //"parser/make-snapshot"
    public makeSnapshot() {
        fs.mkdtemp(path.join(os.tmpdir(), 'bella-language-server-'), (err, folder) => {
            if (err) return;
            this.connection.console.log(`["parser/make-snapshot"]: Loading data to make snapshot at ${folder}`);
        });
    }
}
