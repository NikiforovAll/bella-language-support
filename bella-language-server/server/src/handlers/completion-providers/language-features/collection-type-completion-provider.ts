import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

import { BaseCompletionProvider } from '../general-purpose-providers/completion-provider';

const ARRAY_REFERENCE: CompletionItem[] = [
    {
        label: 'FirstOrDefault',
        detail: 'Collection.FirstOrDefault(LAMBDA, defaultValue)',
        kind: CompletionItemKind.Function,
        documentation: {
            value: `Returns the first element of a sequence that satisfies a specified condition or a default value if no such element is found.`,
            kind: "markdown"
        }
    },
    {
        label: 'First',
        detail: 'Collection.First(LAMBDA)',
        kind: CompletionItemKind.Function,
        documentation: {
            value: `Returns the first element of a sequence.`,
            kind: "markdown"
        }
    },
    {
        label: 'Any',
        detail: 'Collection.Any(LAMBDA)',
        kind: CompletionItemKind.Function,
        documentation: {
            value: `Determines whether any element of a sequence satisfies a condition.`,
            kind: "markdown"
        }
    },
    {
        label: 'All',
        detail: 'Collection.All(LAMBDA)',
        kind: CompletionItemKind.Function,
        documentation: {
            value: `Determines whether all elements of a sequence satisfy a condition.`,
            kind: "markdown"
        }
    },
    {
        label: 'Where',
        detail: 'Collection.Where(LAMBDA)',
        kind: CompletionItemKind.Function,
        documentation: {
            value: `Filters a sequence of values based on a predicate. Each element's index is used in the logic of the predicate function.`,
            kind: "markdown"
        }
    },
    {
        label: 'Take',
        detail: 'Collection.Take(Integer)',
        kind: CompletionItemKind.Function,
        documentation: {
            value: `Returns a specified number of contiguous elements from the start of a sequence.`,
            kind: "markdown"
        }
    },
    {
        label: 'Skip',
        detail: 'Collection.Skip(Integer)',
        kind: CompletionItemKind.Function,
        documentation: {
            value: `Bypasses a specified number of elements in a sequence and then returns the remaining elements.`,
            kind: "markdown"
        }
    },
    {
        label: 'GroupBy',
        detail: 'Collection.GroupBy(Func<TSource,TKey> keySelector, System.Collections.Generic.IEqualityComparer<TKey> comparer)',
        kind: CompletionItemKind.Function,
        documentation: {
            value: `Groups the elements of a sequence according to a specified key selector function and compares the keys by using a specified comparer.`,
            kind: "markdown"
        }
    },
    {
        label: 'Count',
        detail: 'Collection.Count()',
        kind: CompletionItemKind.Function,
        documentation: {
            value: `Gets the number of elements contained in the Collection.`,
            kind: "markdown"
        }
    },
    {
        label: 'Min',
        detail: 'Collection.Min()',
        kind: CompletionItemKind.Function,
        documentation: {
            value: `Returns the minimum value in a sequence of values.`,
            kind: "markdown"
        }
    },
    {
        label: 'Max',
        detail: 'Collection.Max()',
        kind: CompletionItemKind.Function,
        documentation: {
            value: `Returns the maximum value in a sequence of values.`,
            kind: "markdown"
        }
    },
    {
        label: 'Sum',
        detail: 'Collection.Sum()',
        kind: CompletionItemKind.Function,
        documentation: {
            value: `Computes the sum of a sequence of numeric values.`,
            kind: "markdown"
        }
    },
];
const DICTIONARY_REFERENCE: CompletionItem[] = [
    {
        label: 'Select',
        detail: 'Dictionary.Select(LAMBDA)',
        kind: CompletionItemKind.Function,
        documentation: {
            value: `Projects each element of a sequence into a new form.`,
            kind: "markdown"
        }
    },
    {
        label: 'SelectMany',
        detail: 'Dictionary.SelectMany(Func<TSource,System.Collections.Generic.IEnumerable<TCollection>> collectionSelector, Func<TSource,TCollection,TResult> resultSelector)',
        kind: CompletionItemKind.Function,
        documentation: {
            value: `Projects each element of a sequence to an IEnumerable<T>, flattens the resulting sequences into one sequence, and invokes a result selector function on each element therein.`,
            kind: "markdown"
        }
    },
    {
        label: 'ContainsKey',
        detail: 'Dictionary.ContainsKey(Object)',
        kind: CompletionItemKind.Function,
        documentation: {
            value: `Determines whether the Dictionary contains a specific key.`,
            kind: "markdown"
        }
    },
    {
        label: 'Keys',
        detail: 'Dictionary.Keys()',
        kind: CompletionItemKind.Function,
        documentation: {
            value: `Returns keys for the dictionary.`,
            kind: "markdown"
        }
    },
];
export class CollectionTypeCompletionProvider extends BaseCompletionProvider {
    toCompletionItem(declaration: import("../../../registry/declaration-registry/lsp-declaration-registry").KeyedDeclaration): CompletionItem {
        throw new Error("Method not implemented.");
    }
    constructor(private objectName: string) {
        super();
    }
    getCompletions(): CompletionItem[] {
        const sourceString = this.objectName;
        if (sourceString.match(/\[.*\]/)) {
            return sourceString.indexOf('*') !== -1 ? ARRAY_REFERENCE : DICTIONARY_REFERENCE;
        }
        return [];
    }
}
