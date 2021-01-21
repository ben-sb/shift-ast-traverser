# Shift AST Traverser

Allows you to easily traverse Shift ASTs or AST nodes. [shift-traverser](https://github.com/Constellation/shift-traverse-js) wasn't working for me so I wrote this.

## Usage

### traverse

```javascript
const source = `let a = 'Hello World';`
const $script = refactor(source);

traverse($script, {
    enter: function(node) {
        console.log(`Entering ${node.type}`);
    },
    leave: function(node) {
        console.log(`Leaving ${node.type}`);
    }
});
```

### replace

```javascript
const source = `let message = 'Hello World';`
const $script = refactor(source);

replace($script, {
    enter: function(node) {
        if (node.type == 'LiteralStringExpression') {
            return new Shift.LiteralStringExpression({
                value: 'Why hello there!'
            })
        }
    }
});

console.log($script.codegen());
```
