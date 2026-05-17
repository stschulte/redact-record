# Simple Sanitizer

A library to (partially) sanitize or modify single values or
objects.

Sample:

```typescript
const originalLog = {
  name: "Alice",
  action: "add ToDo"
}

const auditLog = sanitizeValue(originalLog, {
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

It tries to be as simple as possible.

## Usage

In order to sanitize an object, you need a sanitizer object. This needs the
same attributes with functions as values that perform the desired redaction.

### Single value examples

Change a string to `[REDACTED]` 

```typescript
sanitizeValue("Hello World", () => '[REDACTED]'
// Result: "[REDACTED]"
```

Only print the first letter of the string, redact the rest

```typescript
sanitizeValue("Hello World", (original) => `${original.substring(0, 1)}...`)
// Result: "H..."
```

### Array example

If the input is an array, the sanitizer function is called for each item.

```typescript
sanitizeValue(["Alice", "Bob"], (original) => `${original.substring(0, 1)}...`)
// Result: ["A...", "B..."]
```

### Object example

If you want to redact a nested object, you can provide a sanitizer which follows
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

