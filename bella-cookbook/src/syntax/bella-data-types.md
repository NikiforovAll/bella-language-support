# Data Types [bella.core.models]

- [Data Types [bella.core.models]](#data-types-bellacoremodels)
  - [Primitives](#primitives)
    - [String [bella.core.models.string]](#string-bellacoremodelsstring)
    - [Boolean [bella.core.models.bool]](#boolean-bellacoremodelsbool)
    - [Integer [bella.core.models.int]](#integer-bellacoremodelsint)
    - [Number [bella.core.models.number]](#number-bellacoremodelsnumber)
    - [Decimal [bella.core.models.decimal]](#decimal-bellacoremodelsdecimal)
    - [Date &amp; Date Time [bella.core.models.dates]](#date-amp-date-time-bellacoremodelsdates)
    - [Enums [bella.core.models.enum]](#enums-bellacoremodelsenum)
    - [Errors [bella.core.models.error]](#errors-bellacoremodelserror)
  - [Aliases [bella.core.models.alias]](#aliases-bellacoremodelsalias)
  - [Objects [bella.core.models.object]](#objects-bellacoremodelsobject)
    - [Casting](#casting)
    - [Object initializers](#object-initializers)
    - [Empty / Nulls /Default values](#empty--nulls-default-values)
    - [Auto-calculated fields](#auto-calculated-fields)
  - [Arrays [bella.core.collections.array]](#arrays-bellacorecollectionsarray)
    - [Access element by index](#access-element-by-index)
    - [Mutate array](#mutate-array)
    - [Traverse](#traverse)
  - [Dictionaries / Maps [bella.core.collections.dictionary]](#dictionaries--maps-bellacorecollectionsdictionary)
    - [Access element by key](#access-element-by-key)
    - [Mutate dictionary](#mutate-dictionary)
  - [Models / Contracts](#models--contracts)

## Primitives

Bella has limited amount of standard primitives that you could work with:

- String
- Boolean
- Integer
- Decimal
- Date
- DateTime
- Enum/Errors

### String [bella.core.models.string]

Strings are enclosed in double quotes. `"Bella is awesome"`

💡 You could concatenate string with "+" operator: `LogInfo("Hello" + Name)`

### Boolean [bella.core.models.bool]

```bella
True | False
```

### Integer [bella.core.models.int]

### Number [bella.core.models.number]

### Decimal [bella.core.models.decimal]

### Date & Date Time [bella.core.models.dates]

Date is initialized like this: `Date(<yyyy>, <dd>, <mm>)`.

💡 You could cast `Date` to `DateTime`: `Date(<yyyy>, <dd>, <mm>) as DateTime`

### Enums [bella.core.models.enum]

You could define your own enum:

```bella
enum WeekDay
    Monday
    Tuesday
    Wednesday
    Thursday
    Friday
    Saturday
    Sunday
```

Use it like this: `WeekDay.<EnumItem>`.

### Errors [bella.core.models.error]

Errors are define in `./Domain/common/DomainError.bs`

```bella
enum DomainError
    DomainError = 1
    CustomError = 2
```

Throw errors: `error[CustomError] "<errorMessage>"`

## Aliases [bella.core.models.alias]

It is not common to define variable of type in Bella. Instead, we use *aliases*.

Bella alias is a type and variable at the same type.

```bella
object HelloWorldMessageId:String
object CreatedOn:DateTime
```

💡 But, if you want to define scoped varialbe inside some procedure you could use `let` keyword: `let MyHelloWorldMessage = <objectInitializer>`

## Objects [bella.core.models.object]

You could define your own Objects. Fields are indented and look like this: `<key>: <Type | Alias>`.

```bella
object HelloWorldMessage
    messageId: HelloWorldMessageId //object fields
    content: String
    createdOn: CreatedOn
```

### Casting

*Cast* objects via `as` operator. `BaseMessage as HelloWorldMessage`
Also, you could check object type via `is` operator.

### Object initializers

```bella
let MyHelloWorldMessage = new HelloWorldMessage(
    messageId = "STRING_LITERAL",
    createdOn = now // DateTime.now literal
  )
// initialize arrays
List(<items...>)
```

### Empty / Nulls /Default values

You could initialize default objects and collections via `new` keyword. Also, Bella has `empty` keyword (kinda like `null`). For dates you could use `emptyDate` keyword.

### Auto-calculated fields

It's like properties in C#.

Example:

```bella
setting EMPHASIS_TOKEN:String = "!"
object HelloWorldMessage
    messageId: HelloWorldMessageId
    content: String
    createdOn: CreatedOn
    contentWithEmphasize: String = content + EMPHASIS_TOKEN
```

Currency

## Arrays [bella.core.collections.array]

```bella
object HelloWorldMessagesList:HelloWorldMessage[*]
<keyword> <name>               <returnType>
```

### Access element by index

Not possible in Bella, :P.

### Mutate array

```bella
  <ICollection> ++= <Object> // adds item
  <ICollection> --= <Object> // removes item by reference*
```

### Traverse

Example:

```bella
foreach HelloWorldMessage in HelloWorldMessagesList
  LogInfo(")
```

## Dictionaries / Maps [bella.core.collections.dictionary]

```bella
object HelloWorldMessageDictionary:HelloWorldMessage[HelloWorldMessageId]
<keyword>  <name>                     <returnType>           <key>
```

### Access element by key

Example:

```bello
Phrase = GreetingPhrases[Languages.Italian]
```

### Mutate dictionary

```bella
  <ICollection>[<Key>] = <Object> //adds item
  <ICollection> --= <Key> //removes item
```

## Models / Contracts

💡 It is good practice to separate domain models from contract/transport models.

Domain models are stored in `./Domain/Components/<ComponentName>/model`

Shared models are used between components and stored in `./Domain/common/models/*`.
