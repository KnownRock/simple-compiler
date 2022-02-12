import tokenize from './tokenize'
import parse from './parse'
import traverseAstToString from './traverseAstToString'


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

const expDecTokenTypes: Array<[string, RegExp]> = [
  ['identifier', /^[a-zA-Z][a-zA-Z0-9]*/],
  ['or', /^\|/],
  ['zm', /^\*/],
  ['om', /^\+/],
  ['lb', /^\(/],
  ['rb', /^\)/],
  ['sp', /^ +/],
]


const result = tokenize(expDecTokenTypes,'(EX)')
console.log(result);

const preGrammer = [
  ['MAIN', 'EX', 'EOF'],
  ['EX', 'identifier EXC'],
  ['EX', 'lb EX rb EXC'],

  ['EXC', ''],
  ['EXC', 'sp identifier EXC'],
].map(grammar => {
  const [name, productions] = grammar
  if(productions === '') return [name, []]
  const productionsArray = productions.split(' ')
  return [name, productionsArray]
})

// the target which convert to
const ll1Grammars = [
  ['identifier:MAIN', 'EX', 'EOF'],
  ['lb:MAIN', 'EX', 'EOF'],

  ['identifier:EX', 'identifier EXC'],
  ['lb:EX', 'lb EX rb EXC'],

  ['rb:EXC', ''],
  ['EOF:EXC', 'EOF'],
  ['sp:EXC', 'sp identifier EXC'],
].map(grammar => {
  const [name, productions] = grammar
  if(productions === '') return [name, []]
  const productionsArray = productions.split(' ')
  return [name, productionsArray]
})


function toLl1Grammar(preGrammer){
  const ll1Grammar = []
  const firstDict = {}
  preGrammer.forEach(item => {
    const [key, value] = item
    // init firstDict
    firstDict[key] = firstDict[key] || []
    if(value.length > 0) {
      firstDict[key].push(value[0])
    }
  })
  console.log(firstDict);
  

  // which grammar can be emtpy
  const nullableDict = {}
  preGrammer.forEach(item => {
    const [key, value] = item
    if(value.length === 0) {
      nullableDict[key] = true
    }
  })

  // every production fllows add thier parent
  // const lastDict = {}
  // preGrammer.forEach(item=>{
  //   const [key, value] = item
  //   lastDict[key] = lastDict[key] ?? new Set()
  //   if(value.length > 0) {
  //     const lastItem = value[value.length - 1]
  //     // maybe useless
  //     if(lastItem !== key) {
  //       lastDict[key].add(key)
  //     }
  //   }
  // })
  // console.log(lastDict);
  
  // reverse type
  const lastDict = {}
  preGrammer.forEach(item => {
    const [key, value] = item
    if(value.length > 0) {
      const lastItem = value[value.length - 1]
      if(lastItem !== key){
        lastDict[lastItem] = lastDict[lastItem] || new Set()
        lastDict[lastItem].add(key)
      }
    }
  })
  console.log(lastDict);
  

  const followDict:{
    [key: string]: Set<string>
  } = {}
  preGrammer.forEach(item => {
    const [key, value] = item
    // followDict[key] = followDict[key] || []
    if(value.length > 0) {
      // first collect all the follow of the production
      value.forEach((el,index) => {
        // is in custom express
        if(firstDict[el]){
          followDict[el] = followDict[el] || new Set()
          const nextItem = value[index + 1]
          if(nextItem){
            followDict[el].add(nextItem)
          }
        }
      })

      // then collect from it parent
      // value.forEach((el,index) => {
      //   if(firstDict[el]){
      //     const parent = followDict[key]
      //     if(parent){
      //       Array.from(parent).forEach(item => {
      //         followDict[el].add(item)
      //       })
      //     }
      //   }
      // })
    }
  })    
        


  console.log(followDict);
  

  // preGrammer.forEach(rule => {
  //   const [left, right] = rule
  //   const rightTokens = right.split(' ')
  //   const rightTokensLength = rightTokens.length



  // console.log(preGrammer);
}

toLl1Grammar(preGrammer);



// ['EX', 'EX ((operator1|operator2) EX)*'],
// const ll1Grammars: Array<[string, string[]]> = [
//   ['identifier:EX', 'identifier EXC'],
//   ['lb:EX', 'lb EX rb'],
  
//   ['EOF:EX', ''],
//   ['EOF:EX', ''],

//   // ['operator1:EX', 'operator1 EX'],
  
//   // ['operator1:EXC', 'operator1 EX EXC'],
//   // ['operator2:EXC', 'operator2 EX EXC'],
//   // ['EOF:EXC', ''],

// ].map(grammar => {
//   const [name, productions] = grammar
//   if(productions === '') return [name, []]
//   const productionsArray = productions.split(' ')
//   return [name, productionsArray]
// })

// const ast = parse(['EX', 'EOF'], ll1Grammars, result)
// console.log(1);

// console.log(traverseAstToString(ast));


// const mainExpression = ['EX', 'EOF']
// const grammar = [
//   ['EX', 'number'],
//   ['EX', 'EX ((operator1|operator2) EX)*'],
//   ['EX', 'operator1 EX'],
// ]


// const ll1Grammars: Array<[string, string[]]> = [
//   ['number:EX', 'number EXC'],

//   ['operator1:EX', 'operator1 EX'],
  
//   ['operator1:EXC', 'operator1 EX EXC'],
//   ['operator2:EXC', 'operator2 EX EXC'],
//   // ['(:EX', '( EX ) EXC'],
//   // ['):EXC',''],
//   ['EOF:EXC', ''],

// ].map(grammar => {
//   const [name, productions] = grammar
//   if(productions === '') return [name, []]
//   const productionsArray = productions.split(' ')
//   return [name, productionsArray]
// })

// const trimedTokens = result.filter(token => token.type !== 'spaces')
// console.log(trimedTokens);



// function parse(mainExpression,tokens: token[]) {

//   // initialize grammar table
//   const grammarTable: {
//     [key: string]: Array<string>
//   } = {}

//   ll1Grammars.forEach(grammar => {
//     const [key, value] = grammar
//     grammarTable[key] = value
//   })



//   function getNode(nodeType, wordType) {
//     if (!grammarTable[wordType + ':' + nodeType]) {
//       return null;
//     }
//     return {
//       type: 'NODE',
//       need: grammarTable[wordType + ':' + nodeType],
//       id:wordType + ':' + nodeType,
//       node: [],
//       nptr: 0
//     };
//   }

//   function addToken(tree, token) {
    
    
//     // if ast is full return
//     if (tree.nptr == tree.need.length) return false;

//     // get the next needed word's type 
//     var nowNodeType = tree.need[tree.nptr];
//     // if the word is not the same type, fill the word to the ast
//     if (nowNodeType == token.type) {
//       tree.node.push({
//         type: 'WORD',
//         id:token.type,
//         token: token
//       });
//       // increment the pointer
//       tree.nptr++;

//       // if the word dont have the same type, get the node from the grammar 
//     } else {
//       // get the child node
//       var child = tree.node[tree.nptr];
//       // if the child node is not exist, create it from the grammar
//       if (child == null) {
//         child = getNode(tree.need[tree.nptr], token.type);
//         if (child == null) {
//           throw {
//             type: 'parse error',
//             // pos: token.pos,
//             token: token
//           }
//         }
//         tree.node.push(child);
//       }

//       // add word to the child node, if the child node is full, add to next node
//       if (!addToken(child, token)) {
//         // increment the pointer
//         tree.nptr++;
//         // add word to the self
//         return addToken(tree, token);
//       }
//     }
//     return true;
//   }

//   function resolveExpress() {
//     var express = {
//       type: 'NODE',
//       need: mainExpression,
//       node: [],
//       nptr: 0,
//     };


//     for (var i = 0; i < tokens.length; i++) {
//       if (!addToken(express, tokens[i])) {
//         throw {
//           type: '',
//           // pos: markedWords[i].pos,
//           word: tokens[i]
//         }
//       }
//     }
//     return express;
//   }


//   return resolveExpress();
// }

// const ast = parse(mainExpression,trimedTokens)



// function traverseAstToString(ast, tab){
//   let str = ``
//   if(ast.type === 'NODE'){
//     // console.log(tab + ast.id)
//     str += '\n' + tab + ast.id
//     for(let i = 0; i < ast.node.length; i++){
//       str += traverseAstToString(ast.node[i], tab + '\t')
//     }
//   }else if(ast.type === 'WORD'){
//     str += (tab + ast.id + ':' + ast.token.value)
//   }
//   return str
// }

// console.log(traverseAstToString(ast, ''))

// export {}