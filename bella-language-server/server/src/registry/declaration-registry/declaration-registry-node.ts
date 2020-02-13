import { BaseDeclaration, DeclarationType, MemberComposite } from 'bella-grammar';
import { isEmpty, isNil } from 'lodash';
import { DeclarationOverload, DeclarationKey, KeyedDeclaration } from './lsp-declaration-registry';
import { Dictionary } from 'typescript-collections';
import { NodeRegistrySearchQuery } from './declaration-registry-query';

export class DeclarationRegistryNode {

    private overloads: Dictionary<DeclarationKey, DeclarationOverload>
        = new Dictionary<DeclarationKey, DeclarationOverload>();

    constructor(private nodes: Dictionary<DeclarationKey, KeyedDeclaration>, public namespace: string, public componentName: string) {
    }

    getDeclarations(query?: NodeRegistrySearchQuery): KeyedDeclaration[] {
        if (!isNil(query)) {
            let { typeFilter, nameFilter } = query;
            if (typeFilter?.active && nameFilter?.active) {
                let declarationName = nameFilter.name;
                let accessDeclarationKey =
                    new DeclarationKey(declarationName, typeFilter.type);
                if (this.getNodes().containsKey(accessDeclarationKey)) {
                    let foundDeclaration = this.getNodes().getValue(accessDeclarationKey)
                    return !!foundDeclaration ? [foundDeclaration] : [];
                } else {
                    if (!query.fallbackRules ||
                        query.fallbackRules.fallbackTypeProbe.type != typeFilter.type) {
                        return [];
                    }
                    let rule = query.fallbackRules.fallbackTypeProbe;
                    let fallbackDeclarationKey = rule
                        .fallbackTypes
                        .map((t: DeclarationType) => new DeclarationKey(declarationName, t))
                        .find((k: DeclarationKey) => {
                            return this.getNodes().containsKey(k);
                        });
                    if (!fallbackDeclarationKey) {
                        return [];
                    }
                    let foundFallbackDeclaration = this.getNodes().getValue(fallbackDeclarationKey)
                    return !!foundFallbackDeclaration ? [foundFallbackDeclaration] : [];
                    // start to probe fallback rules
                }
            } else {
                const declarations = this.getValues(
                    query.overloadsFilter?.active &&
                    query.overloadsFilter?.includeOverloads ||
                    false);
                const isTypeFilterEnabled = !isNil(typeFilter) && typeFilter?.active;
                const isNameFilterEnabled = !isNil(nameFilter) && nameFilter.active;
                const resultDeclarations = isTypeFilterEnabled || isNameFilterEnabled ? declarations.filter(d => {
                    let passed = true;
                    if (isTypeFilterEnabled) {
                        passed = passed && (d.type === typeFilter?.type);
                    }
                    if (isNameFilterEnabled) {
                        passed = passed && (d.name === nameFilter?.name);
                    }
                    return passed;
                }) : declarations;
                return resultDeclarations;
            }
        }
        console.warn('getDeclarations - all values are returned - query is empty');
        // return this.getNodes().values();
        return this.getValues(true);
    }

    setOverloads(overloads: DeclarationOverload[]) {
        this.overloads = new Dictionary<DeclarationKey, DeclarationOverload>();
        overloads.forEach(o => {
            this.overloads.setValue(o.declarationKey, o);
        })
    }

    private getNodes(): Dictionary<DeclarationKey, KeyedDeclaration> {
        return this.nodes;
    }

    private getValues(includeOverloads: boolean): KeyedDeclaration[] {
        const uniqueDeclarations = this.getNodes().values();
        if (includeOverloads) {
            let mergedResult: KeyedDeclaration[] = [];
            let declarationsWithoutOverloads = uniqueDeclarations
                .filter(d => !this.overloads.containsKey(new DeclarationKey(d.name, d.type)));

            mergedResult.push(...declarationsWithoutOverloads)
            this.overloads.values().forEach(overload => {
                mergedResult.push(...overload.overloads)
            });
            return mergedResult;
        }
        return uniqueDeclarations;
    }
}
