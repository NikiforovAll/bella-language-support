# Bella Language Server Changelog

## draft-version - v0.2.0

### Addded

* Command: `Go To Symbol in File...`
  * Keyboard shortcut: `ctrl + o`)
  * Component Service declaration e.g.: `hosted service MyAwesomeService on [Connector]`
  * TODO: procedure
  * TODO: object
  * TODO: formula
  * TODO: setting
  * TODO: service as interface declaration
* Command: `Go To Symbol in Workspace...`
  * Keyboard shortcut: `ctrl + t`
* TODO: Go To Definition
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
