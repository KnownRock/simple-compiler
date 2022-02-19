type Token = {
  type: string,
  value: string,
  line: number,
  column: number
}

type AstNodeHandler = (node: AstNode, getNode: (ast: AstNode) => AstNode) => AstNode

type AstExpNode = {
  type: 'NODE',
  id: string,
  nodes: AstNode[],
  handler?: AstNodeHandler

  // wait for clear
  need: string[],
  nptr: number,
}

type AstTokenNode = {
  type: 'WORD',
  id: string,
  token: Token,
}

type TokenType = [string, RegExp]

type Ll1Grammar = [string, string[], AstNodeHandler?]

type AstNode = AstExpNode | AstTokenNode

type Grammar = [string, string[], AstNodeHandler?]

// how to declare type globally
// https://stackoverflow.com/questions/42025767/how-to-declare-a-type-globally-in-a-project-typescript
