# Services [bella.core.communication.services]

Services allow components to communicate:

* Bella component sends message to CSharp component via WCF
* Bella component puts message for another Bella component into Queue via Kompass

## Host services

You define services in `<ComponentName>/services/Services.bs` by convention.

`external service <serviceName> on <communication>`
`hosted service <serviceName> on <communication>`

- *serviceName* - name of a service defined in `./Domain/common/services`.
- *communication* - [*serviceName* | Kompass | [*externalComponentName*]]

Example:

```bs
hosted service HelloWorld on HelloWorld
external service Greeter on [GreeterCSharp]
```

In order to spin up component services (APIs), you have to define them in `<ComponentName>/services/ApiConfig.bs`

Example:

```bs
setting StartupServices:String = "HelloWorld:HelloWorld;Greeter:[Kompass]"
```

## Share services

In order to share a service with other components you should register it in `./Domain/common/services`
Create file with the name of component of defined service and add public contract to be consumed by other components:

```bella
service HelloWorld
    SayHello() oneway
service Greeter
    Greet(CustomGreeting):Reply
```
