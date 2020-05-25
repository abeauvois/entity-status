# What is a STATUS here?

- It's a nested data structure describing an entity state
- It's only 2 levels deep (/Status/Entity/id:value )

## Example

You can easily describe a list of SELECTED PROJECTS & TABLES this way

```typescript
enum MyStatuses {
  Selected = "SELECTED",
  Focused = "FOCUSED"
}

enum MyEntities {
  Project = "PROJECT",
  Table = "TABLE",
  Column = "COLUMN"
}

const status = new Status({}, MyStatuses, MyEntities);

status.set(Selected, Project, { p3: true, p5: true });
status.set(Selected, Table, { t3: true });

console.log(status.getAll());
// And you'll get the following result (in status.all)
//  {
//  [SELECTED]: {
//    [PROJECT]:{{p3: true}, {p5: true}, ...}
//    [TABLE]:{{t2: true}, ...},
// }
```
