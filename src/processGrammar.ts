// convert grammar to ll1able grammar
export default function processGrammar(grammars) {
  const expNameDict: {
    [key: string]: string;
  } = {}
  grammars.forEach((item) => {
    const [key, value] = item
    expNameDict[key] = key
  })

  function getUniqueExpName(expName) {
    let index = 0
    while (expNameDict[expName]) {
      expName = `${expName}_${index}`
      index++
    }
    expNameDict[expName] = expName
    return expName
  }

  // handle grammars which have the same tail
  const procssedGrammars = []
  grammars.forEach((grammer) => {
    let flag = false
    procssedGrammars.forEach((procssedGrammar) => {
      if (procssedGrammar[0] === grammer[0]) {
        const value = procssedGrammar[1]
        const value2 = grammer[1]

        let ptr = 0
        while (ptr < value.length) {
          if (value[ptr] === value2[ptr]) {
            ptr++
          } else {
            break
          }
        }

        if (ptr > 0) {
          const valueLastPart = value.slice(ptr)
          const value2LastPart = value2.slice(ptr)
          const valueFirstPart = value.slice(0, ptr)

          const grammarExtExpName = getUniqueExpName(grammer[0])
          procssedGrammar[1] = valueFirstPart.concat(grammarExtExpName)
          const handler = procssedGrammar[2] ?? ((el) => el)

          procssedGrammar[2] = (node, getNode) => {
            const index = ptr
            const nodes2 = getNode(node.nodes[index])?.nodes ?? []
            return {
              ...node,
              nodes: node.nodes.slice(0, index).concat(nodes2),
            }
          }
          procssedGrammars.push([grammarExtExpName, value2LastPart])
          procssedGrammars.push([grammarExtExpName, valueLastPart])

          flag = true
        }
      }
    })

    if (!flag) {
      procssedGrammars.push([grammer[0], grammer[1]])
    }
  })

  return procssedGrammars
}
