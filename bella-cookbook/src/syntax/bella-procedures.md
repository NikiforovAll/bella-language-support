# Procedures

Code in *Bella* is written in procedural style with a sprinkles of late binding. Procedural style is fairly easy to comprehend but it could lead to spaghetti code.

You define procedure like this:

```bella
procedure SayHello(Name, out Reply)
<keyword> <methodName> (<params...> [, out<returnType>])
```

💡 If you want to invoke procedure withing same component:

```bella
call SayHello(Name, out Reply)
```

💡 If you want to invoke procedure from another component:

Example:

```bella
SomeData ++=  AnotherComponentService.GetSomeData()
    <operator>  <serviceName>        <publicMethod>
```

💡 Note, there is no difference in invocation of Bella component or another C# component. As long it is registered in services

Example:

```bella
external service CSharpComponentService on [CSharpComponent]
// ...
CSharpComponent.DoSomeWork()
// OR
external service CSharpComponentServiceAsync on [Kompass]
CSharpComponentServiceAsync.DoSomeWork()
```

See [Kompass](../kompass.md), [Service](./bella-services.md) for more details.

## Generic /Specific

```bella
external procedure GenerateRandomInt(MaxCount, out RandomInt)
```

You need to add `External.cs` file to component code.

```csharp
//throw some using here
namespace DomainBellaNS
{
    public partial class DomainBella {
        public void GenerateRandomInt(int maxCount, out int randomInt){
            Random rnd = new Random();
            randomInt = rnd.Next(1, maxCount);
        }
    }
}
```

## Schedulers

Example:

```bella
DoRecurrentTask(CurrentDateTime)  at 2:00 am every day
<procedure declaration>            <TimePart>  <TimeSpan>
```
