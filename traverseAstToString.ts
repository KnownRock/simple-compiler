
function traverseAstToString(ast, tab = ''){
  let str = ``
  if(ast.type === 'NODE'){
    // console.log(tab + ast.id)
    str += '' + tab + 'n:[' + ast.id+']'
    for(let i = 0; i < ast.node.length; i++){
      str += '\n' + traverseAstToString(ast.node[i], tab + '  ')
    }
  }else if(ast.type === 'WORD'){
    str += '' + (tab  + 'w:[' + ast.id + ':' + ast.token.value + ']')
  }
  return str
}

export default traverseAstToString