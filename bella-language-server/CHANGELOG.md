# Bella Language Server Changelog

## draft-version - v.0.3.0

* Command: `Go To References`
  * Keyboard shortcuts: `ctrl+F12`, `ctrl+shift+F12`
  * Implemented:
    * internal procedure invocation

## draft-version - v0.2.5

### Addded

* Command: `Go To Symbol in File...`
  * Keyboard shortcut: `ctrl + o`)
* Command: `Go To Symbol in Workspace...`
  * Keyboard shortcut: `ctrl + t`
* Command: `Go To Definition...` (limited implementation)
  * Component scoped search
  * Object declaration traversing
  * Procedure Params
  * Procedure calls via 'call' statement
  * NOTE: implementation assumes you store component in `src/Domain/Components`
  * HINT: you can use `alt+[left mouse click]` to go to definition in a quick manner
* Command: `Bella: Generate Project Assets`
  * Compile all components from vscode
  * Keyboard shortcut:  `ctrl+shift+b`
* Task: `Build All Components`
  * Builds all components in `src/Domain`
* Task: `Build and Run Component`
  * Builds and runs specified component(s) (regex based names)
* Snippets
  * `logi, loge, procedure, hosted-service, etc...`, for more details see: `snippets\bella.json`

### Fixed

* ISSUE: New line breaks highlighting of procedures inside service declaration

## draft-version - v0.1.0

### Added

* Bella syntax highlighting
* Command: Open Bella cookbook: <https://serene-mcnulty-01b0f0.netlify.com/>
  * `ctrl+shift+p` and type `Bella: Open Docs`
* EditorExperience: Shows when *out parameter*  is not assigned within procedure/scope.
  * NOTE: this is almost useless feature, but it shows capabilities of Bella-Language-Server.
  * KNOWN_ISSUE[#BLP1]: last procedure in file is not check if there is no terminal token (as definition of next scope)
  * KNOWN_ISSUE[#BLP2]: comments are not ignored during parsing
