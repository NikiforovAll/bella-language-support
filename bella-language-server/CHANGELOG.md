# Bella Language Server Changelog

## draft-version - v0.2.0

### Addded

* snippets
  * `logi, loge, procedure, hosted-service, etc...`, for more details see: `snippets\bella.json`

## draft-version - v0.1.0

### Added

* Bella syntax highlighting
* Command: Open Bella cookbook: <https://serene-mcnulty-01b0f0.netlify.com/>
  * `ctrl+shift+p` and type `Bella: Open Docs`
* EditorExperience: Shows when *out parameter*  is not assigned within procedure/scope.
  * NOTE: this is almost useless feature, but it shows capabilities of Bella-Language-Server.
  * KNOWN_ISSUE[#BLP1]: last procedure in file is not check if there is no terminal token (as definition of next scope)
  * KNOWN_ISSUE[#BLP2]: comments are not ignored during parsing
