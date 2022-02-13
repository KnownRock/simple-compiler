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
  ['MAIN', 'EX EOF'],
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
  const firstDict:{
    [key: string]: Set<string>
  } = {}
  const isExpDict:{
    [key: string]: boolean
  } = {}
  preGrammer.forEach(item => {
    const [key, value] = item
    isExpDict[key] = true
    // init firstDict
    firstDict[key] = firstDict[key] ?? new Set()
    if(value.length > 0) {
      firstDict[key].add(value[0])
    }
  })
  
  // replace all exp to extract token
  function fillFirstDict(key, keysDict = {}){
    if(keysDict[key]) return
    keysDict[key] = true
    if(firstDict[key]){
      firstDict[key].forEach(el => {
        fillFirstDict(el, keysDict)
        if(firstDict[el]){
          firstDict[key].delete(el)
          Array.from(firstDict[el]).forEach(el => {
            firstDict[key].add(el)
          })
        }
      })
    }
  }

  preGrammer.forEach(item => {
    const [key, value] = item
    fillFirstDict(key)
  })
  console.log(firstDict);

  
  // reverse type
  const lastDict:{
    [key: string]: Set<string>
  } = {}
  preGrammer.forEach(item => {
    const [key, value] = item
    if(value.length > 0) {
      let lastItem = value[value.length - 1]
      if(key === 'MAIN' || !isExpDict[lastItem]) return 
      lastDict[lastItem] = lastDict[lastItem] || new Set()
      if(lastItem !== key ){
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
    }
  })  

  // fill lastDict by followDict 
  function fillLastDict(key, travedDict = {}){
    if(travedDict[key] || !isExpDict[key]) return
    travedDict[key] = true
    if(lastDict[key]){
      lastDict[key].forEach(el => {
        fillLastDict(el, travedDict)
        if(followDict[el]){
          lastDict[key].delete(el)
          Array.from(followDict[el]).forEach(el => {
            lastDict[key].add(el)
            followDict[key].add(el)
          })
        }
      })
      
    }
  }

  // which grammar can be emtpy
  const nullableDict = {}
  preGrammer.forEach(item => {
    const [key, value] = item
    if(value.length === 0) {
      nullableDict[key] = true
    }
  })
  console.log(nullableDict);
    
  Object.keys(nullableDict).forEach(key => {
    fillLastDict(key)
  })

  console.log(followDict);
  console.log(lastDict);



  
}

toLl1Grammar(preGrammer);

