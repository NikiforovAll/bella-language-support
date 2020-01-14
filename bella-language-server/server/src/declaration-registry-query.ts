import { DeclarationType } from "bella-grammar";

export interface NodeRegistrySearchQuery {
    // NOTE: this filter disables global search and point directly to node for uri
    uriFilter: {
        uri?: string
    } & Activatable

    typeFilter?: {
        type: DeclarationType,
    } & Activatable

    descendantsFilter?: {
        // hasParent?: boolean
        // parentName?: string
    } & Activatable

    namespaceFilter?: {
        namespace: string;
    } & Activatable

    nameFilter?: {
        name: string;
    } & Activatable

    fallbackRules?: {
        fallbackTypeProbe: {
            type: DeclarationType
            fallbackTypes: DeclarationType[]
        }
    }
}

interface Activatable {
    active: boolean
}
