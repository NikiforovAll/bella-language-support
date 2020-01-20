import { DeclarationType } from "bella-grammar";

export interface ReferencesRegistrySearchQuery {

    uriFilter: {
        uri?: string;
    } & Activatable

    namespaceFilter: {
        namespace: string;
    } & Activatable

    typeFilter: {
        type: DeclarationType,
    } & Activatable

    nameFilter: {
        name: string;
    } & Activatable

    //used to search through NestedReferences
    descendantsFilter?: {
        query: {
            name: string,
            type: DeclarationType
        }
    } & Activatable
}

interface Activatable {
    active: boolean
}
