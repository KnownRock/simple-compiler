import tokenize from './tokenize'
import parse from './parse'
import traverseAstToString from './traverseAstToString'
import toLl1Grammar from './toLl1Grammar'
import processGrammar from './processGrammar'

const expDecTokenTypes: Array<[string, RegExp]> = [
  ['identifier', /^[a-zA-Z][a-zA-Z0-9_]*/],
  ['or', /^\|/],
  ['zm', /^\*/],
  ['om', /^\+/],
  ['lb', /^\(/],
  ['rb', /^\)/],
  ['sp', /^ +/],
  ['op', /^\?/],

  ['number', /^[0-9]+/],
  ['lbb', /^{/],
  ['rbb', /^}/],
  ['co', /^,/],
]

// EX ((operator1|operator2) EX)*
// ((operator1|operator2|operator2) EX)*

const tokens = tokenize(expDecTokenTypes, 'a a')
// console.log(tokens);

const grammers = [
  ['MAIN', 'EX EOF'],

  // ['EX', 'identifier sp identifier sp identifier'],
  // ['EX', 'identifier sp identifier'],
  // ['EX', 'identifier'],
  // ['EX', ''],

  // A+ B
  ['EX', 'identifier EXO EXC'],

  // ((A)|B)
  ['EX', 'lb EX EXB rb EXO EXC'],

  // (A)+ 
  ['EXO', 'zm'],
  ['EXO', 'om'],
  ['EXO', 'op'],
  ['EXO', ''],


  // (A|B)
  ['EXB', ''],
  ['EXB', 'or EX EXB'],

  // A B
  ['EXC', ''],
  ['EXC', 'sp EX'],


].map(grammar => {
  const [name, productions] = grammar
  if (productions === '') return [name, []]
  const productionsArray = productions.split(' ')
  return [name, productionsArray]
})



const { procssedGrammars: p } = processGrammar(grammers)


const ll1 = toLl1Grammar(p, false);

const ast = parse('MAIN', ll1, tokens);


function traverse(ast) {

  if (ast.type === 'NODE') {
    const nodes = []

    ast.nodes.forEach((node) => {

      if (node.type === 'NODE') {
        if (node.handler) {
          const ns = node.handler(node, traverse)
          ns.forEach(n => {
            nodes.push(n)
          })
        } else {
          nodes.push(traverse(node))
        }

      } else if (node.type === 'WORD') {
        nodes.push(node)
      }
    })

    return ({
      type: ast.type,
      id: ast.id,
      nodes
    })

  } else {
    return ast
  }

}

const a = traverse(ast)

console.log(traverseAstToString(a));




