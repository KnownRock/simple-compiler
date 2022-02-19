function tokenize(tokenTypes: TokenType[], inputCode: string) {
  let code = inputCode
  const tokens: Token[] = []
  let line = 1
  let column = 0

  // traverse through the code
  while (code.length > 0) {
    // find the first token
    const token: Token = {
      type: '',
      value: '',
      line,
      column,
    }

    // find the token type
    // eslint-disable-next-line @typescript-eslint/no-loop-func
    tokenTypes.forEach(([type, re]) => {
      const match = code.match(re)

      // get the longest match
      if (match && match[0].length > token.value.length) {
        const [tokenValue] = match

        token.type = type
        token.value = tokenValue
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
