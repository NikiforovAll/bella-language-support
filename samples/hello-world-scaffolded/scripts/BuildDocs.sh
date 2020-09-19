#!/bin/sh
BLUE='\033[1;34m'
GOLD='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

printf "${BLUE}Don't forget to re-build bella project before documentation build!${NC}\n\n"

printf "${GOLD}Collecting contracts...${NC}\n"
echo -e "----------------------------------------------\n"
# Collects all contract to parse;
../docs/ImportExtWS.sh

printf "${GOLD}Building contracts as (component-api-def.json)...${NC}\n"
echo -e "----------------------------------------------\n"

../bin/bella-project-scanner/bella-project-scanner-cli.exe

printf "${GOLD}Generating contracts based on (component-api-def.json)...${NC}\n"
echo -e "----------------------------------------------\n"

COMPONENT_API_DEF_PATH='./docs/meta/component-api-def.json'
COMPONENT_API_DEST='./docs/source/components-api'

# NOTE: yo changes working directory to location of .yo-rc file
yo bella:docs --path $COMPONENT_API_DEF_PATH --output $COMPONENT_API_DEST

printf "${GOLD}Fetching component communication information${NC}\n"
echo -e "----------------------------------------------\n"

../docs/GenerateComponentDependencies.sh

printf "${GOLD}Converting README.md to README.rst${NC}\n"
echo -e "----------------------------------------------\n"

if [[ -x "$(command -v pandoc)" ]]; then
    pandoc --from=markdown --to=rst --output=../docs/source/README.rst ../README.md
    printf "docs/source/README.rst was generated."
else
    printf "${RED}Pandoc is not installed, step is ommited!${NC}"
fi

printf "\n${GOLD}Building docs...${NC}\n"
echo -e "----------------------------------------------\n"
# Builds docs based on sphinx;
../docs/Build.sh ../docs