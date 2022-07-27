# Some programming language

This is a very basic interpreted programming language.

# Basics

### Installation

##### Locally

First, clone the repo: `git clone https://github.com/neverUsedGithub/SomeProgrammingLanguage`.

Second, open the clone repo: `cd SomeProgrammingLanguage`.

Third, run your program with: `node dist/index.js <FILE>`.

#### Replit

Just open [this link](https://replit.com/github/neverUsedGithub/SomeProgrammingLanguage).

### Syntax

The language's syntax is like python and js combined. `;`s are necessary unless the last character is a `}`.

### Variables

To set a variable use the keyword `var`. Only 2 data types are supported for now, integers and strings.

```js
var a = 10;
var b = "hi";
```

To modify the value of a variable just type the variables name, `=` and your value.

```js
a = 5;
b = 32;

a += 3;
b -= 10;
```

#### If statements

```go
if 3 < 10 {
  print("Less!");
}
```
```
Less!
```
### While statements

```js
var a = 0;

while a < 10 {
  print(a);
  a += 1;
}
```
```
0
..
9
```
### Functions
```go
func greet(str) {
  return "Hello " + str;
}

print(greet("world!"));
```

```
Hello world!
```
