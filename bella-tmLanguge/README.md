# Salesforce Bella Language Grammar

## Introduction

This repository contains the source code for generating the language grammar files for Bella.

Output: grammars

## TODOs

* Define grammar for Bella
  * what features should we support?
* Compile and replace corresponding file in bella-language-server
* CONSIDER: tests for bella language, for now current tests fail

Links:

* https://github.com/forcedotcom/apex-tmLanguage
* https://macromates.com/manual/en/language_grammars
* https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide
* https://code.visualstudio.com/api/references/contribution-points#contributes.grammars
* https://macromates.com/manual/en/language_grammars
* https://macromates.com/manual/en/regular_expressions
* https://github.com/microsoft/TypeScript-TmLanguage/blob/master/TypeScript.YAML-tmLanguage
* https://www.apeth.com/nonblog/stories/textmatebundle.html

## Bella Language Features

* TOO

## Disclaimer

Development and setup of this project has not been tested for Windows OS. You may see a node-gyp error - [follow the instructions here to resolve it](https://github.com/nodejs/node-gyp/blob/master/README.md).

## Development

To **build and test** install Node.js do the following:

- Run `npm install` to install any dependencies.
- Run `gulp` to build and run tests.

Output grammars are output in the `grammars\` dirctory.

### Adding grammar rules

Token structure is based off of [Textmate's Language Grammar guidelines](https://manual.macromates.com/en/language_grammars)

## Attribution

This repository was copied from [https://github.com/dotnet/apex-tmLanguage](https://github.com/dotnet/csharp-tmLanguage)
