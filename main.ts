import tokenize from './tokenize'
import parse from './parse'
import traverseAstToString from './traverseAstToString'
// import toLl1Grammar from './toLl1Grammar'

const expDecTokenTypes: Array<[string, RegExp]> = [
  ['identifier', /^[a-zA-Z][a-zA-Z0-9]*/],
  ['or', /^\|/],
  ['zm', /^\*/],
  ['om', /^\+/],
  ['lb', /^\(/],
  ['rb', /^\)/],
  ['sp', /^ +/],
  ['op', /^\?/],
]

// EX ((operator1|operator2) EX)*
// ((operator1|operator2|operator2) EX)*

const tokens = tokenize(expDecTokenTypes, '*+')
console.log(tokens);

const preGrammer = [
  ['MAIN', 'EX EOF'],

  // ['EX', 'A B C'],
  // ['A', ''],
  // ['B', ''],
  // ['C', ''],
  // ['A', 'a'],
  // ['B', 'b'],
  // ['C', 'c'],


  ['EX', 'identifier OPO EXC'],

  ['OPO', ''],
  ['OPO', 'op'],

  // bug in here , that or:EXO rule is not correct 
  // need to handle by single rule?
  ['EX', 'lb EX EXB rb EXO EXC'],

  ['EXO', 'zm'],
  ['EXO', 'om'],
  ['EXO', ''],

  ['EXB', ''],
  ['EXB', 'or EX EXB'],


  ['EXC', ''],
  ['EXC', 'sp EX'],


].map(grammar => {
  const [name, productions] = grammar
  if (productions === '') return [name, []]
  const productionsArray = productions.split(' ')
  return [name, productionsArray]
})
function toLl1Grammar(preGrammer, isLog = false) {
  const ll1Grammars: Array<[string, string[]]> = [];
  const firstDict: {
    [key: string]: Set<string>;
  } = {};
  const isExpDict: {
    [key: string]: boolean;
  } = {};

  preGrammer.forEach(item => {
    const [key, value] = item;
    isExpDict[key] = true;
    // init firstDict
    firstDict[key] = firstDict[key] ?? new Set();
    if (value.length > 0) {
      firstDict[key].add(value[0]);
    }
  });

  // replace all exp to extract token
  function fillFirstDict(key, keysDict = {}) {
    if (keysDict[key])
      return;
    keysDict[key] = true;
    if (firstDict[key]) {
      firstDict[key].forEach(el => {
        fillFirstDict(el, keysDict);
        if (firstDict[el]) {
          firstDict[key].delete(el);
          Array.from(firstDict[el]).forEach(el => {
            firstDict[key].add(el);
          });
        }
      });
    }
  }

  preGrammer.forEach(item => {
    const [key, value] = item;
    fillFirstDict(key);
  });
  console.log(firstDict);

  preGrammer.forEach(item => {
    const [key, value] = item;
    const firstItem = value[0];

    if (firstItem) {
      if (isExpDict[firstItem]) {
        Array.from(firstDict[firstItem]).forEach(el => {
          ll1Grammars.push([`${el}:${key}`, value]);
        });
      } else {
        ll1Grammars.push([`${firstItem}:${key}`, value]);
      }
    }
  });


  console.log(ll1Grammars);

  // which grammar can be emtpy
  const nullableDict: {
    [key: string]: boolean;
  } = {};
  preGrammer.forEach(item => {
    const [key, value] = item;
    if (value.length === 0) {
      nullableDict[key] = true;
    }
  });
  console.log(nullableDict);


  const followDict: {
    [key: string]: Set<string>;
  } = {};
  const fathersDict: {
    [key: string]: Set<string>;
  } = {}
  preGrammer.forEach(item => {
    const [key, value] = item;
    // followDict[key] = followDict[key] || []
    if (value.length > 0) {
      // first collect all the follow of the production
      value.forEach((el, index) => {
        // is in custom express
        if (firstDict[el]) {
          followDict[el] = followDict[el] || new Set();
          const nextItem = value[index + 1];

          // if(nullableDict[nextItem]) return

          if (nextItem) {
            followDict[el].add(nextItem);
          } else {
            fathersDict[el] = fathersDict[el] || new Set();
            fathersDict[el].add(key);
          }
        }
      });
    }
  });

  console.log(followDict);
  // // fill lastDict by followDict 
  function fillFollowDict(key, travedDict = {}) {
    if (travedDict[key] || !isExpDict[key]) return;
    travedDict[key] = true;
    if (followDict[key]) {
      followDict[key].forEach(el => {
        if (isExpDict[el]) {
          fillFollowDict(el, travedDict);

          followDict[key].delete(el);

          if (fathersDict[el]) {
            Array.from(fathersDict[el]).forEach(ell => {
              Array.from(followDict[ell]).forEach(elll => {
                followDict[el].add(elll);
              })
            });
          }
          // if next item is nullable, add next item's follow to this item's follow
          if (nullableDict[el]) {
            Array.from(followDict[el]).forEach(el => {
              followDict[key].add(el);
            });
          }


          Array.from(firstDict[el]).forEach(el => {
            followDict[key].add(el);
          });

        }
      });

    }
  }

  Object.keys(followDict).forEach(key => {
    fillFollowDict(key);
  });
  console.log(followDict);
  // // which grammar can be emtpy
  // const nullableDict:{
  //   [key: string]: boolean;
  // } = {};
  // preGrammer.forEach(item => {
  //   const [key, value] = item;
  //   if (value.length === 0) {
  //     nullableDict[key] = true;
  //   }
  // });
  // console.log(nullableDict);

  // Object.keys(nullableDict).forEach(key => {
  //   fillLastDict(key);
  // });

  // Object.keys(nullableDict).forEach(key => {
  //   fillFollowDict(key);
  // });



  // console.log(followDict);
  // console.log(lastDict);

  Object.keys(nullableDict).forEach(key => {
    const follow = followDict[key];
    if (follow) {
      Array.from(follow).forEach(el => {
        if (!isExpDict[el]) {
          ll1Grammars.push([`${el}:${key}`, []]);
        }
      });
    }
  });

  return ll1Grammars
}



const ll1 = toLl1Grammar(preGrammer, true);

console.log(ll1.map(([a, b]) => [a, b.join(' ')]));


const ast = parse(['MAIN'], ll1, tokens);
console.log(traverseAstToString(ast));
