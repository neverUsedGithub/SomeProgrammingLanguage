
# Some programming language

This is a programming language i made in like 2 days so don't expect much. If you find any bugs please write to me on discord: `neverUsedDiscord#1120`.

# Basics
### Installation
First, clone the repo: `git clone https://github.com/neverUsedGithub/SomeProgrammingLanguage`.  
Second, open the clone repo: `cd SomeProgrammingLanguage`.  
Third, run your program with: `node dist/index.js <FILE>`.  
### Syntax
The language's syntax is like python and js combined. `;`s are necessary unless the last character is a `}`.
### Variables

To set a variable  use the keyword `var`. Only 2 data types are supported for now, integers and strings.
```js
var a = 10;
var b = "hi";
```
To modify the value of a variable just type the variables name, `=` and your value.
```js
a = 5;
b = b + 5;
```
**Note: `+=`, `-=` , `*=`, `/=` are not supported yet.**
#### ~~If statements~~ Coming Soon
```go
if 3 < 10 {
	print("Less!");
}
```
### ~~While statements~~ Coming Soon
```js
var a = 0;
while a < 10 {
	print(a);
	a = a + 1;
}
```
### Functions
```js
func greet(str) {
	return "Hello " + str;
}

print(greet("world!"));
```
```
Hello world!
```
### Classes are in the code but don't use them because they make the interpreter crash.