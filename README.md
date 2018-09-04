## fake-template

Who needs real templates anyway?

### Installation
```
npm i fake-template --save
```

### Usage

```
const template = require('fake-template')
const gloriousMissive = template('Dear ${name}, we found the perfect ${title} job in ${location} for you!')
console.log(gloriousMissive({ name: 'Joanna', title: 'Cosmonaut', location: 'London' }))
```

This is equivalent to

```
const name = 'Joanna', title = 'Cosmonaut', location = 'London'
console.log(`Dear ${name}, we found the perfect ${title} job in ${location} for you!`)
```

### Warnings

Contains `eval` and `with` on the same line
Also, code inside your expressions have access to anything, so be careful when using strings coming from users

### Contributions

Bug reports highly appreciated

PRs super welcome

### TODO
For completeness' sake it would be good to support [raw_strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Raw_strings).

Better error messages would be great as well.

### Tests
Tests live in the index file in the shape of a bunch of asserts.

Tests get removed automatically at `postinstall` using `sed`.


### License
MIT
