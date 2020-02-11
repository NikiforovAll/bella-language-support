import { CompletionItem } from 'vscode-languageserver';

import { BaseCompletionProvider } from '../completion-provider';
import { ExclusiveSourceCompletionProvider } from '../exclusive-source-completion-provider';
import { MultipleSourceCompletionProvider } from '../multiple-source-completion-provider';
import { DateTimeTypeCompletionProvider } from './date-time-type-completion-provider';
import { DateTypeCompletionProvider } from './date-type-completion-provider';
import { StringTypeCompletionProvider } from './string-type-completion-provider';
import { IntegerTypeCompletionProvider } from './integer-type-completion-provider';
import { CompletionUtils } from '../../../utils/completion.utils';
import { BooleanTypeCompletionProvider } from './boolean-time-type-completion-provider';
import { DecimalTypeCompletionProvider } from './decimal-type-completion-provider';

/**
 * Built-in types
 */
export class TypeCompletionProvider extends BaseCompletionProvider {
    provider: MultipleSourceCompletionProvider;

    constructor(objectName: string) {
        super();
        if(objectName === CompletionUtils.EMPTY_COMPLETION_SOURCE_ARRAY_LABEL){
            this.provider = new MultipleSourceCompletionProvider(
                new StringTypeCompletionProvider(),
                new BooleanTypeCompletionProvider(),
                new DateTimeTypeCompletionProvider(),
                new DateTypeCompletionProvider(),
                new IntegerTypeCompletionProvider(),
                new DecimalTypeCompletionProvider(),
            );
        }else {
            this.provider = new ExclusiveSourceCompletionProvider(
                new StringTypeCompletionProvider(objectName),
                new DateTimeTypeCompletionProvider(objectName),
                new DateTypeCompletionProvider(objectName),
                new IntegerTypeCompletionProvider(objectName),
            );
        }
    }
    getCompletions(): CompletionItem[] {
        return this.provider.getCompletions();
    }
}
