# Bella Project Structure 📂

* `./Components` - C# components.
* `./Domain` - Bella components.
  * `common` - shared logic and contracts.
    * `formulas` - shared formulas.
    * `model` - shared models.
    * `services` - public contracts.
      * `<ComponentName>/<ServiceName>.api.bs` - describes public contract of service in component.
    * `DomainError.bs` - shared enum for errors.
    * `busConfig.json` - Kompass config. Component communication based on Message Queues.
  * `<ComponentName>/Bella` - bella compiler. 🛠
  * `<ComponentName>/<ComponentName>` - root folder of \<ComponentName\> component.
    * `model` - aliases, models.
    * `services` - implementations of services (e.g. \<ComponentName\>, \<ComponentName\>Async)
    * `ApiConfig.bs` - API config.
    * `PersistentObjects.bs` - registration of persistent objects.
    * `Services.bs` - describes component communications.
