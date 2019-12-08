# HelloWorldScaffolded

## Project Structure

### scripts

| Script                     | Description                                                         |
|----------------------------|---------------------------------------------------------------------|
| ./Cleanup.ps1              | deletes storage and gen folder                                      |
| ./CompileAllComponents.ps1 | compiles all components                                             |
| ./Run.ps1                  | compiles and starts all components                                  |
| ./Request.ps1              | example request to call SOAP request                                |
| ./BuildDocs.sh             | build documentation (api ref and component communication explorer). |
| ./HostAllDocs.ps1          | simple powershell-based http server to host docs.                   |

### src

* Components - C# components.
* Domain - Bella components.
  * common - shared resources.
    * formulas - shared formulas.
    * model - shared models.
    * services - public contracts.
      * \<ComponentName\>/\<ServiceName\>.api.bs - describes public contract of service in component.
    * DomainError.bs - shared error enum.
    * busConfig.json - Kompass config.
  * \<ComponentName\>/Bella - bella compiler.
  * \<ComponentName\>/\<ComponentName\> - root folder of \<ComponentName\> component.
    * model - aliases, models.
    * services - implementations of services (e.g. \<ComponentName\>, \<ComponentName\>Async)
    * ApiConfig.bs - API config.
    * PersistentObjects.bs - registration of persistent objects.
    * Services.bs - describes component communications.

### docs

* docs/source - source file of sphinx based documentation.
* docs/build -- build goes here.

### bin

Binaries for component generation, documentation scaffolding.

## Guidelines and Recommendations

* How to add component?
  * Run `yo bella:component`. This will generate bella component template in 'src/Domain/Components'.
    * Specify component name (PascalCase).
    * Specify component(s) to interact with (this will be included in component Services.bs file that describes component communications).
* How to add service (based on project structure).
  * By convention, you can add service to \<ComponentName\>/\<ComponentName\>/\<ServiceName\>.service.bs. (**implementation**) And edit host file \<ComponentName\>/\<ComponentName\>/Service.bs (**hosting**).
  * Also, services should be registered in src/Domain/common/services/\<ComponentName\>/\<ServiceName>.api.bs (**public contracts**)

## Dependencies

Please make sure you have next dependencies installed:

* yo
* generator-bella
* sphinx
  * <http://www.sphinx-doc.org/en/master/usage/installation.html>
* pandoc

## Bella Compiler

 > You should request bella compiler from your point of contact. Note, that bella compiler should contain generic config templates in order to make it work with bella scaffolder.