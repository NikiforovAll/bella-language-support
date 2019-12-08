#!/bin/sh
PROJECT_BASE_PATH="..\src\Domain"
OUTPUT_PATH="..\docs\meta\component-communications-payload.json"
COMPONENT_COMMUNICATION_PATH="..\bin\component-communication\assets\component-communication.json"

find $PROJECT_BASE_PATH -name "Services.bs" -type f -exec awk '
    function join(array, start, end, sep,  result, i)
    {
        if (sep == "")
        sep = " "
        else if (sep == SUBSEP) # magic value
        sep = ""
        result = array[start]
        for (i = start + 1; i <= end; i++)
            result = result sep array[i]
        return result
    }
    BEGIN {
        numberOfComponents=0;
    }
    BEGINFILE  {
        
        numberOfComponents++;
        num_tokens = split(FILENAME, filePathTokens, "/")
        componentName = filePathTokens[num_tokens-2];
        currentComponentString = "{\"name\": \"" componentName "\","
    }
    /hosted service/ && !/^\/\// { 
        hosted[$3] = $5;
    }
    /external service/ && !/^\/\// {
        external[$3] = $5;
    }
    ENDFILE {
        hostedCount = 1;
        externalCount = 1;
        # for (key in hosted) { 
        #     print "hosted-" key
        # }
        # for (key in external) { 
        #     print "external-" key
        # }
        for (key in hosted) { 
            tokens[hostedCount++] = "{\"name\": \"" key "\", " "\"on\": \"" hosted[key] "\"}";
        }
        for (key in external) { 
            tokens2[externalCount++] = "{\"name\": \"" key "\", " "\"on\": \"" external[key] "\"}";
        }
        # why this works? Some problems with actual evaluation of tokens<i>
        for (key in tokens) { 
            tmp="token1-" key
        }
        for (key in tokens2) { 
            tmp="token2-" key
        }

        if ( length(tokens) > 0 ) {
            currentComponentString = currentComponentString "\"services\": [" join(tokens, 1, length(tokens), ", ") "],"
            delete hosted
            delete tokens
        }
        else {
            currentComponentString = currentComponentString "\"services\": [],"
        }

        if ( length(tokens2) > 0) {
            currentComponentString = currentComponentString "\"consumes\": [" join(tokens2, 1, length(tokens2), ", ") "]}"
            delete external
            delete tokens2
        } else {
            currentComponentString = currentComponentString "\"consumes\": []}"
        }
        components[numberOfComponents] = currentComponentString
    }
    END {
        localComponentCount = 1;
        printf "%s", "{\"nodes\": ["
        for (key in components) { 
            printf "%s", components[key];
            if(localComponentCount != length(components))
            {
                printf "%s", ", "
            }
            localComponentCount++;
        }
        printf "%s", "]}"
    }
' {} + | tee $OUTPUT_PATH $COMPONENT_COMMUNICATION_PATH
# ' {} + 
