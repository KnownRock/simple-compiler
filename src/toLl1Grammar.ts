export default function toLl1Grammar(preGrammer, isLog = false) {
  const ll1Grammars: Array<[string, string[], Function?]> = [];
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
  // console.log(firstDict);

  preGrammer.forEach(item => {
    const [key, value, retf] = item;
    const firstItem = value[0];

    if (firstItem) {
      if (isExpDict[firstItem]) {
        Array.from(firstDict[firstItem]).forEach(el => {
          ll1Grammars.push([`${el}:${key}`, value, retf]);
        });
      } else {
        ll1Grammars.push([`${firstItem}:${key}`, value, retf]);
      }
    }
  });


  if (isLog)
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
  if (isLog) console.log(nullableDict);


  const followDict: {
    [key: string]: Set<string>;
  } = {};
  const fathersDict: {
    [key: string]: Set<string>;
  } = {};
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

  if (isLog)
    console.log(followDict);
  if (isLog)
    console.log(fathersDict);

  // // fill lastDict by followDict 
  function fillFollowDict(key, travedDict = {}) {
    if (travedDict[key] || !isExpDict[key])
      return;
    travedDict[key] = true;
    if (followDict[key]) {
      followDict[key].forEach(el => {
        if (isExpDict[el]) {
          fillFollowDict(el, travedDict);

          followDict[key].delete(el);
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
      
      
      fathersDict[key] && fathersDict[key].forEach(el => {
        Array.from(followDict[el]).forEach(ell => {
          followDict[key].add(ell);
        });
      });

    }
  }

  Object.keys(followDict).forEach(key => {
    fillFollowDict(key);
  });
  if (isLog)
    console.log(followDict);

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

  return ll1Grammars;
}