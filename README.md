# Bella Language Server

This project provides better developer experience of writing in Bella to vscode.

## Introduction

This repository contains different projects:

## bella-language-server

It is vscode-extension packed with features such as:

* Syntax Highlighting for Bella (programming language)
* Language Server Implementation

Depends on: *bella-grammars*

## bella-grammar

Since Bella compiler is a black box that outputs some C# code, it is not possible to reuse it as part of this application. So I've decided to use ANTLR4 to produce lexer and parser.

Bella grammar is descried in ANTLR4 and packaged as typescript module.

## bella-generator

* Bella project structure scaffolding
* Run & Debug assets generation. Something what 'ms-dotnettools.csharp' does.
* Documentation generation for components defined in Bella
  * Documentation is build in .rst format, so it is possible to build any kind of output. By default, docs are generated as HTML file.
  * It also contains Component-Dependency-Explorer to visualize dependencies <https://github.com/NikiforovAll/bella-component-communications>. Note, bella-component-communications is a separate project, and it is baked in bella-language-server generator and copied when you scaffold you project via CLI. You can find how this explorer would look like here: <https://github.com/NikiforovAll/bella-component-communications#bella-component-communication>

## samples

Samples of Bella applications scaffolded via *bella-generator*.

* hello-world-scaffolded - example of bella application to be supported by this extension
