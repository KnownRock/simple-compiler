
function traverseAstToString(ast, tab = ''){
  let str = ``
  if(ast.type === 'NODE'){
    // console.log(tab + ast.id)
    str += '' + tab + '+' + ast.id
    for(let i = 0; i < ast.node.length; i++){
      str += '\n' + traverseAstToString(ast.node[i], tab + '\t')
    }
  }else if(ast.type === 'WORD'){
    str += '' + (tab +  '|' + ast.id + ':' + ast.token.value)
  }
  return str
}

export default traverseAstToString