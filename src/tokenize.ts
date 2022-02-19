type token = {
  type: string,
  value: string,
  line: number,
  column: number
}

function tokenize(tokenTypes, inputCode: string) {
  let code = inputCode
  const tokens: token[] = []
  let line = 1
  let column = 0

  // traverse through the code
  while (code.length > 0) {
    // find the first token
    const token: token = {
      type: '',
      value: '',
      line,
      column,
    }

    // find the token type
    tokenTypes.forEach((type) => {
      const match = code.match(type[1])

      // get the longest match
      if (match && match[0].length > token.value.length) {
        token.type = type[0]
        token.value = match[0]
        code = code.substring(match[0].length)
        column += match[0].length
      }
    })

    // if no token found, throw error
    if (token.type === '') {
      throw new Error(`Unexpected token: ${code[0]}`)
    }

    // add the token to the list
    tokens.push(token)

    // if line break, increment line and reset column
    if (token.type === 'line-break') {
      line++
      column = 0
    } else {
      column += token.value.length
    }
  }

  tokens.push({
    type: 'EOF',
    value: 'EOF',
    line,
    column,
  })

  return tokens
}

export default tokenize
