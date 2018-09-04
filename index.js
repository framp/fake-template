const assert = require('assert') // TEST
const parse = ({ stack, mode, counter }, char) => {
  const lastToken = stack[stack.length-1]
  if (char === '$' && mode === 'literal') {
    if (lastToken[lastToken.length-1] !== '\\') {
      return { stack, mode: 'open', counter }
    }
    stack[stack.length - 1] = lastToken.substring(0, lastToken.length-1)
  }
  if (char === '{') {
    if (mode === 'open') {
      stack.push('')
      return { stack, mode: 'code', counter: 0 }
    }
    if (mode === 'code') {
      counter++
    }
  }
  if (char === '}' && mode === 'code') {
    if (counter === 0) {
      stack.push('')
      return { stack, mode: 'literal', counter}
    }
    counter--
  }
  if (mode === 'open') {
    stack[stack.length - 1] += '$'
    mode = 'literal'
  }
  stack[stack.length - 1] += char
  return { stack, mode, counter }
}
assert.equal(parse({ stack: [''], mode: 'literal'}, 'a').stack[0], 'a') // TEST
assert.equal(parse({ stack: [''], mode: 'literal'}, 'a').mode, 'literal') // TEST
assert.equal(parse({ stack: [''], mode: 'literal'}, '$').mode, 'open') // TEST
assert.equal(parse({ stack: [''], mode: 'open'}, 'a').stack[0][0], '$') // TEST
assert.equal(parse({ stack: [''], mode: 'open'}, 'a').mode, 'literal') // TEST
assert.equal(parse({ stack: [''], mode: 'open'}, '{').stack.length, 2) // TEST
assert.equal(parse({ stack: [''], mode: 'open'}, '{').mode, 'code') // TEST
assert.equal(parse({ stack: [''], mode: 'open'}, '{').counter, 0) // TEST
assert.equal(parse({ stack: ['', ''], mode: 'code'}, '#').stack[1], '#') // TEST
assert.equal(parse({ stack: ['', ''], mode: 'code'}, '#').mode, 'code') // TEST
assert.equal(parse({ stack: ['', 'if '], mode: 'code', counter: 0}, '{').stack[1], 'if {') // TEST
assert.equal(parse({ stack: ['', 'if '], mode: 'code', counter: 0}, '{').counter, 1) // TEST
assert.equal(parse({ stack: ['', '42'], mode: 'code', counter: 0}, '}').stack.length, 3) // TEST
assert.equal(parse({ stack: ['', '42'], mode: 'code', counter: 0}, '}').mode, 'literal') // TEST
assert.equal(parse({ stack: ['', '42'], mode: 'code', counter: 0}, '}').counter, 0) // TEST

const evalInContext = context => expression => { with(context) { return eval(expression) } }
assert(evalInContext({clown:42})('clown')) // TEST

const defaultTag = (literals, ...expressions) =>
  literals.reduce(({ result, expressions }, literal) => ({
    result: result + literal + (expressions.length ? expressions[0] : ''),
    expressions: expressions.slice(1)
  }), { result: '', expressions }).result
assert.equal(defaultTag(['hello from ', ' side ', ''], 'the other', 'my friend'), 'hello from the other side my friend') // TEST

const template = (string, tag=defaultTag) => {
  const { stack, mode, counter} = string.split('').reduce(parse, { stack: [''], mode: 'literal', counter: 0 })
  const expressions = stack.filter((v, i) => i % 2 === 1)
  const literals = stack.filter((v, i) => i % 2 === 0)
  if (expressions.some(exp => !exp)) throw new Error('Invalid template')
  if (mode !== 'literal') throw new Error('Invalid template')
  return (context={}) => tag(literals, ...expressions.map(evalInContext(context)))
}
module.exports = template
assert.equal(template('')(), ``) // TEST
assert.equal(template('abc')(), `abc`) // TEST
const dog = 'Orlando' // TEST
const cat = 'Daniela' // TEST
assert.equal(template('abc ${dog} lol ${cat}')({dog}), `abc ${dog} lol ${cat}`) // TEST
assert.equal(template('abc ${dog} lol')({dog}), `abc ${dog} lol`) // TEST
assert.equal(template('abc ${dog} lol ${42}')({dog}), `abc ${dog} lol ${42}`) // TEST
assert.equal(template('ok ${41+{Orlando:10}[dog]-{Daniela:9}[cat]}')({dog, cat}), `ok ${41+{Orlando:10}[dog]-{Daniela:9}[cat]}`) // TEST
assert.equal(template('lol \\${dog}')(), `lol \${dog}`) // TEST