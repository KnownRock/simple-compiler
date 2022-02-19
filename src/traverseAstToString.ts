function traverseAstToString(ast, tab = '') {
  let str = ''
  if (ast.type === 'NODE') {
    // console.log(tab + ast.id)
    str += `${tab}${ast.id.split(':')[1]}`
    for (let i = 0; i < ast.nodes.length; i++) {
      str += `\n${traverseAstToString(ast.nodes[i], `${tab}  `)}`
    }
  } else if (ast.type === 'WORD') {
    str += `${tab + ast.id}:` + `[${ast.token.value}]`
  }
  return str
}

export default traverseAstToString
