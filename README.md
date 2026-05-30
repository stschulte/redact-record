# Simple Redact

A library to (partially) redact values with typesafety and
zero dependencies.

Sample:

```typescript
import { redact } from 'simple-redact'

const originalLog = {
  name: "Alice",
  action: "add ToDo"
}

// Redact `name` from the log. `name` will
// be redacted by only printing the first and last character
const auditLog = redact(originalLog, {
  name: (name) => {
    if(name.length > 3) {
      const firstChar = name.charAt(0)
      const lastChar = name.charAt(name.length - 1)
      const redacted = "·".repeat(name.length - 2)
      return `${firstChar}${redacted}${lastChar}`·
    }
    else {
      return "·".repeat(name.length)
    }
  }
})

console.log(auditLog)
```

Will now return

```text
{
  "action": "add ToDo",
  "name": "A···e",
}
```

It tries to be as simple as possible. The redact function takes the original
object or value and a sanitizer object.

This works as following:

```typescript
type Log = {
    action: string;
    name: string;
    tags: string[];
}

type S = Sanitizer<Log>
// S will resolve to the type
//
// S = {
//     action?: (originalValue: string) => string;
//     name?: (originalValue: string) => string;
//     tags?: (originalTag: string) => string;
// } | (originalObject: Log) => Log
//
// To redact the complet object, or only individual fields
```

## Usage

In order to redact an object, you need a sanitizer. This is either a function
retrieving the original value and returning a redacted version of it, or an
object to only redact individual attributes of the original object.

### Single value examples

Change a string to `[REDACTED]` 

```typescript
redact("Hello World", () => '[REDACTED]'
// Result: "[REDACTED]"
```

Only print the first letter of the string, redact the rest

```typescript
redact("Hello World", (original) => `${original.substring(0, 1)}...`)
// Result: "H..."
```

### Array example

If the input is an array, the sanitizer function is called for each item.

```typescript
redact(["Alice", "Bob"], (original) => `${original.substring(0, 1)}...`)
// Result: ["A...", "B..."]
```

### Object example

If you want to redact an object, you can provide a sanitizer which follows
the same attributes. Let's take the following example:

```typescript
const input = {
    user: {
        name: 'Alice',
        age: 22,
    }
    action: "add Todo"
}
```
if you want redact the complete user information, but keep the action, you can
do this

```typescript
sanitizeValue(input, { user: (originalUser) => "REDACTED" })
```

If you only want to sanitize the name of the user, you could do this:

```typescript
sanitizeValue(input, { user: { name: (originalName) => "REDACTED" } })
```

