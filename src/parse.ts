function parse(mainExpression:string, ll1Grammars:Ll1Grammar[], tokens: Token[]) {
  // initialize grammar table
  const grammarTable: {
    [key: string]: Array<string>
  } = {}

  const handlerTable: {
    [key: string]: AstNodeHandler | undefined
  } = {}

  ll1Grammars.forEach((grammar) => {
    const [key, value, handler] = grammar
    grammarTable[key] = value
    handlerTable[key] = handler
  })

  function getNode(nodeType:string, wordType:string):AstNode | null {
    if (!grammarTable[`${wordType}:${nodeType}`]) {
      return null
    }
    return {
      type: 'NODE',
      need: grammarTable[`${wordType}:${nodeType}`],
      handler: handlerTable[`${wordType}:${nodeType}`],
      id: `${wordType}:${nodeType}`,
      nodes: [],
      nptr: 0,
    }
  }

  function addToken(tree:AstNode, token:Token):boolean {
    // for typescript lint
    if (tree.type !== 'NODE') return true

    // if ast is full return
    if (tree.nptr === tree.need.length) return false

    // get the next needed word's type
    const nowNodeType = tree.need[tree.nptr]
    // if the word is not the same type, fill the word to the ast
    if (nowNodeType === token.type) {
      tree.nodes.push({
        type: 'WORD',
        id: token.type,
        token,
      })
      // increment the pointer
      // eslint-disable-next-line no-param-reassign
      tree.nptr++

      // if the word dont have the same type, get the node from the grammar
    } else {
      // get the child node
      let child:AstNode|null = tree.nodes[tree.nptr]
      // if the child node is not exist, create it from the grammar
      if (child == null) {
        child = getNode(tree.need[tree.nptr], token.type)
        if (child == null) {
          throw new Error(`Unexpected token: ${token.type}`)
          // {
          //   type: 'parse error',
          //   // pos: token.pos,
          //   token,
          // }
        }
        tree.nodes.push(child)
      }

      // add word to the child node, if the child node is full, add to next node
      if (!addToken(child, token)) {
        // increment the pointer
        // eslint-disable-next-line no-param-reassign
        tree.nptr++
        // add word to the self
        return addToken(tree, token)
      }
    }
    return true
  }

  function resolveExpress() {
    const express:AstExpNode = {
      type: 'NODE',
      need: [mainExpression],
      id: 'root',
      nodes: [],
      nptr: 0,
    }

    for (let i = 0; i < tokens.length; i++) {
      if (!addToken(express, tokens[i])) {
        throw new Error(`Unexpected token: ${tokens[i].type}`)
        // throw {
        //   type: '',
        //   word: tokens[i],
        // }
      }
    }
    return express
  }

  // remove processed words
  return resolveExpress().nodes[0]
}

export default parse
