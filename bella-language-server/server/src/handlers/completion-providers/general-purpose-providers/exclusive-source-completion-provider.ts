import { CompletionItem } from 'vscode-languageserver';

import { CommonUtils } from '../../../utils/common.utils';
import { BaseCompletionProvider, CompletionProvider } from './completion-provider';
import { KeyedDeclaration } from '../../../registry/declaration-registry/lsp-declaration-registry';

const PROVIDER_PRIORITY: {
    [type: string]: number;
} = {
    'ObjectFieldCompletionProvider': 99,
    'PrimitiveTypeCompletionProvider': 199,
    'EnumEntryCompletionProvider': 299,
    'ObjectCompletionProvider': 399,
    'EnumCompletionProvider': 499,
    'PersistentObjectCompletionProvider': 599,
    'ServiceCompletionProvider': 699,
};

const DEFAULT_PRIORITY = 0;

export type Predicate = (...args:any[]) => boolean;

export class ExclusiveSourceCompletionProvider extends BaseCompletionProvider {

    providers: CompletionProvider[];

    constructor(...providers: CompletionProvider[]) {
        super();
        this.providers = providers.sort(this.OrderProviderComparer);
    }

    toCompletionItem(declaration: KeyedDeclaration): CompletionItem {
        throw new Error("Method not implemented.");
    }
    getCompletions(): CompletionItem[] {
        for (const provider of this.providers) {
            const completions = provider.getCompletions();
            if (completions.length > 0) {
                return completions;
            }
        }
        return [];
        // return this.providers
        //     .map(p => p.getCompletions())
        //     .reduce((acc, completion) => acc.concat(completion));
    }

    private OrderProviderComparer(p1: CompletionProvider, p2: CompletionProvider) {
        const priority1 = PROVIDER_PRIORITY[CommonUtils.getClassName(p1) || 'NOT_FOUND'] || DEFAULT_PRIORITY;
        const priority2 = PROVIDER_PRIORITY[CommonUtils.getClassName(p2) || 'NOT_FOUND'] || DEFAULT_PRIORITY;
        return - priority1 + priority2;
    }

}

