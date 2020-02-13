import { DeclarationType } from "bella-grammar";

export interface NodeRegistrySearchQuery {
    // NOTE: this filter disables global search and point directly to node for uri
    uriFilter: {
        uri?: string
    } & Activatable

    typeFilter?: {
        type: DeclarationType,
    } & Activatable

    // flattens descendants to search result
    descendantsFilter?: {
        query?: NodeRegistrySearchQuery
        // if
        discardParent?: boolean
        // hasParent?: boolean
        // parentName?: string
    } & Activatable

    namespaceFilter?: {
        namespace: string;
        //namespace subdivision as component name
        componentName?: string
        // by default it is included
        excludeCommon?: boolean;
    } & Activatable

    nameFilter?: {
        name: string;
    } & Activatable
    // this should be used only for natural replacements in language: e.g. object, enum, primitiveType
    // for potential ambiguity - use BellaAmbiguousReference
    fallbackRules?: {
        fallbackTypeProbe: {
            type: DeclarationType
            fallbackTypes: DeclarationType[]
        }
    }
    // NOTE: currently works only for bulk search in uriFilter
    overloadsFilter?: {
        includeOverloads: boolean
    } & Activatable
}

interface Activatable {
    active: boolean
}
