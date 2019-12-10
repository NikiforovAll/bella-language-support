# Built-in features

- [Built-in features](#built-in-features)
  - [Operators](#operators)
  - [Bella LINQ](#bella-linq)
  - [Logging](#logging)
  - [Utils](#utils)

## Operators

```bella
is, is not
as
+, -, *, /
<,>,<=,>=, ==
||, &&
++=, --=
!
```

## Bella LINQ

```bella
// Map
<ICollection>.Select(<expr>)
<ICollection>.SelectMany(<expr>)
<ICollection>.GroupBy(<expr>)

//Filter
<ICollection>.Where(<expr>)
<ICollection>.Take(<expr>)
<ICollection>.Skip(<expr>)

<ICollection>.First(<expr>)
<ICollection>.FirstOrDefault(<expr>, defaultValue)

//Aggregate
<ICollection>.Count()
<ICollection>.Any(<expr>)
<ICollection>.All(<expr>)
<ICollection>.Min()
<ICollection>.Max()
<ICollection>.Sum()

<IDictionary>.ContainsKey()
<IDictionary>.Keys()

// expr: el => <expr>
```

## Logging

```bella
LogInfo(<string>)
LogError(<string>)
```

## Utils

```bella
IsEmpty(<ICollection>)
DeepCopy(<Object>)
"<RegExp>".IsMatch(<stringToMatch>)
<DateTime>.Date()
<String>.Split(<sep>)
.Replace("<from>", "<to>")
.With() // ??? TODO: clarify
<Date>..<Date> // generates date ranges* TODO: clarify
<Object> is empty
<Object> is not empty
<procedure declaration> at <TimePart> every <TimeSpan> // define schedulers in Bella
```

