import NodeCache = require("node-cache");


export interface DeclarationCacheProvider {
    declarationCompletionCache: NodeCache;
}
