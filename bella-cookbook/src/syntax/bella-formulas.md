
# Formulas [bella.core.formulas]

Example:

```bella
formula <FormulaName>(<TransformedObject>, ...<params>):<ReturnType> = new <ReturnType>(
  <ReturnType>.<Field> = <expr>
)
```

Example:

```bella
formula ToPlainText(Address):String = Address.street + " " +
  Address.houseNumber + Address.extension + ", " +
  Address.zip + ", " + Address.city
```

## Share formulas

Formulas could be shared if you put them in `./Domain/common/*` folder.
