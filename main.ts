type token = {
  type: string,
  value: string,
  line: number,
  column: number
}

const tokenTypes: Array<[string, RegExp]> = [
  ['number', /^[0-9]+(\.[0-9]+)?/],
  ['line-break', /^\n/],
  ['spaces', /^ +/],

  // on + - before number
  ['operator1', /^[+-]/],
  ['operator2', /^[*/]/],
  ['(', /^\(/],
  [')', /^\)/],
]


function tokenize(inputCode: string) {
  let code = inputCode
  let tokens: token[] = []
  let line = 1
  let column = 0

  // traverse through the code
  while (code.length > 0) {

    // find the first token
    let token: token = {
      type: '',
      value: '',
      line: line,
      column: column
    }

    // find the token type
    tokenTypes.forEach(type => {
      const match = code.match(type[1])

      // get the longest match
      if (match && match[0].length > token.value.length) {
        token.type = type[0]
        token.value = match[0]
        code = code.substring(match[0].length)
        column += match[0].length
      }
    })

    // if no token found, throw error
    if (token.type === '') {
      throw new Error('Unexpected token: ' + code[0])
    }

    // add the token to the list
    tokens.push(token)

    // if line break, increment line and reset column
    if (token.type === 'line-break') {
      line++
      column = 0
    } else {
      column += token.value.length
    }
  }

  tokens.push({
    type: 'EOF',
    value: '',
    line: line,
    column: column
  })

  return tokens

}

const result = tokenize('1+---1')
console.log(result);

const mainExpression = ['EX', 'EOF']


const ll1Grammars: Array<[string, string[]]> = [
  ['number:EX', 'number EXC'],
  ['operator1:EX', 'operator1 EX'],
  ['operator1:EXC', 'operator1 EX EXC'],
  ['operator2:EXC', 'operator2 EX EXC'],
  ['(:EX', '( EX ) EXC'],
  ['):EXC',''],
  ['EOF:EXC', ''],

].map(grammar => {
  const [name, productions] = grammar
  if(productions === '') return [name, []]
  const productionsArray = productions.split(' ')
  return [name, productionsArray]
})

const trimedTokens = result.filter(token => token.type !== 'spaces')
console.log(trimedTokens);



function parse(mainExpression,tokens: token[]) {

  // initialize grammar table
  const grammarTable: {
    [key: string]: Array<string>
  } = {}

  ll1Grammars.forEach(grammar => {
    const [key, value] = grammar
    grammarTable[key] = value
  })



  function getNode(nodeType, wordType) {
    if (!grammarTable[wordType + ':' + nodeType]) {
      return null;
    }
    return {
      type: 'NODE',
      need: grammarTable[wordType + ':' + nodeType],
      node: [],
      nptr: 0
    };
  }

  function addToken(tree, token) {
    
    
    // if ast is full return
    if (tree.nptr == tree.need.length) return false;

    // get the next needed word's type 
    var nowNodeType = tree.need[tree.nptr];
    // if the word is not the same type, fill the word to the ast
    if (nowNodeType == token.type) {
      tree.node.push({
        type: 'WORD',
        token: token
      });
      // increment the pointer
      tree.nptr++;

      // if the word dont have the same type, get the node from the grammar 
    } else {
      // get the child node
      var child = tree.node[tree.nptr];
      // if the child node is not exist, create it from the grammar
      if (child == null) {
        child = getNode(tree.need[tree.nptr], token.type);
        if (child == null) {
          throw {
            type: 'parse error',
            // pos: token.pos,
            token: token
          }
        }
        tree.node.push(child);
      }

      // add word to the child node, if the child node is full, add to next node
      if (!addToken(child, token)) {
        // increment the pointer
        tree.nptr++;
        // add word to the self
        return addToken(tree, token);
      }
    }
    return true;
  }

  function resolveExpress() {
    var express = {
      type: 'NODE',
      need: mainExpression,
      node: [],
      nptr: 0,
    };


    for (var i = 0; i < tokens.length; i++) {
      if (!addToken(express, tokens[i])) {
        throw {
          type: '',
          // pos: markedWords[i].pos,
          word: tokens[i]
        }
      }
    }
    return express;
  }


  return resolveExpress();
}

const ast = parse(mainExpression,trimedTokens)

console.log(ast);