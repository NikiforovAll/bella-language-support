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
}

interface Activatable {
    active: boolean
}
