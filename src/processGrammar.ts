// convert grammar to ll1able grammar
export default function processGrammar(grammars: Grammar[]) {
  const expNameDict: {
    [key: string]: string;
  } = {}
  grammars.forEach((item) => {
    const [key] = item
    expNameDict[key] = key
  })

  function getUniqueExpName(expName: string) {
    let index = 0
    let uniqueExpName: string = expName
    while (expNameDict[uniqueExpName]) {
      uniqueExpName = `${expName}_${index}`
      index++
    }
    expNameDict[uniqueExpName] = uniqueExpName
    return uniqueExpName
  }

  // handle grammars which have the same tail
  const procssedGrammars: Grammar[] = []
  grammars.forEach((grammer) => {
    let flag = false
    procssedGrammars.forEach((procssedGrammar, index) => {
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
          procssedGrammars[index][1] = valueFirstPart.concat(grammarExtExpName)
          const handler = procssedGrammar[2]

          procssedGrammars[index][2] = (node: AstExpNode, getNode): AstNode => {
            const p = ptr
            // the new exp generated is a AstExpNode
            const nodes2 = (getNode(node.nodes[p]) as AstExpNode).nodes

            const n = {
              ...node,
              handler,
              nodes: node.nodes.slice(0, p).concat(nodes2),
            }

            return n
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
