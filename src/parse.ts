type token = {
  type: string,
  value: string,
  line: number,
  column: number
}


function parse(mainExpression, ll1Grammars,tokens: token[]) {
  // initialize grammar table
  const grammarTable: {
    [key: string]: Array<string>
  } = {}

  const handlerTable: {
    [key: string]: Function
  } = {}

  ll1Grammars.forEach(grammar => {
    const [key, value, handler] = grammar
    grammarTable[key] = value
    handlerTable[key] = handler
  })



  function getNode(nodeType, wordType) {
    if (!grammarTable[wordType + ':' + nodeType]) {
      return null;
    }
    return {
      type: 'NODE',
      need: grammarTable[wordType + ':' + nodeType],
      handler: handlerTable[wordType + ':' + nodeType],
      id:wordType + ':' + nodeType,
      nodes: [],
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
      tree.nodes.push({
        type: 'WORD',
        id:token.type,
        token: token
      });
      // increment the pointer
      tree.nptr++;

      // if the word dont have the same type, get the node from the grammar 
    } else {
      // get the child node
      var child = tree.nodes[tree.nptr];
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
        tree.nodes.push(child);
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
      need: [mainExpression],
      id:'root',
      nodes: [],
      nptr: 0,
    };


    for (var i = 0; i < tokens.length; i++) {
      if (!addToken(express, tokens[i])) {
        throw {
          type: '',
          word: tokens[i]
        }
      }
    }
    return express;
  }

  // remove processed words
  return resolveExpress().nodes[0];
}

export default parse;