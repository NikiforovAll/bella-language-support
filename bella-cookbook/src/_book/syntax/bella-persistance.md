# Persistance

## Data

Bella stores all data in memory and do writing to storage on back thread. You don't need to worry about updating your data, Bella does it for you under the hood.

All you need is to define collection that you want to store:

```bella
// store list
persistent object CollectionName:CollectionItem[*]
<keyword>  <collectionName> <returnedType> <specialSequenceToTellItIsAList>

// store dictionary
persistent object CollectionName:CollectionItem[Key]
    <keyword>  <collectionName> <returnedType> <keyType>
```

💡 In code, you could use next technique to signify persistent object: (might be stored weirdly in a database)

```bella
persistent object RootPersistentObject
    SomeCollection:CollectionItem[*]
    secretNumber: Integer

// usage

foreach CollectionItem in RootPersistentObject.SomeCollection
    //do some work
```

## Settings

Example:

```bella
setting HelloWorldDefault:String = "Hello World!"
```
