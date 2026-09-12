import { readFile, writeFile, mkdir, readdir } from "node:fs/promises"
import { resolve, relative, sep } from "node:path"
import ts from "typescript"

export async function generateComponentApi(root, families) {
  const config = ts.readConfigFile(resolve(root, "tsconfig.json"), ts.sys.readFile)
  if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"))
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root)
  const program = ts.createProgram(parsed.fileNames, { ...parsed.options, noEmit: true })
  const checker = program.getTypeChecker()

  function literal(node, seen = new Set()) {
    if (!node || seen.has(node)) throw new Error("API data requires a statically readable value.")
    seen.add(node)
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
    if (ts.isNumericLiteral(node)) return Number(node.text)
    if (node.kind === ts.SyntaxKind.NullKeyword) return null
    if (node.kind === ts.SyntaxKind.TrueKeyword) return true
    if (node.kind === ts.SyntaxKind.FalseKeyword) return false
    if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken) return -literal(node.operand, seen)
    if (ts.isAsExpression(node) || ts.isParenthesizedExpression(node)) return literal(node.expression, seen)
    if (ts.isIdentifier(node)) {
      let symbol = checker.getSymbolAtLocation(node)
      if (symbol?.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol)
      const declaration = symbol?.valueDeclaration
      if (declaration && ts.isVariableDeclaration(declaration)) return literal(declaration.initializer, seen)
    }
    throw new Error(`Cannot infer API value: ${node.getText()}`)
  }

  function visible(member) {
    return !member.modifiers?.some(modifier => [
      ts.SyntaxKind.PrivateKeyword, ts.SyntaxKind.ProtectedKeyword, ts.SyntaxKind.StaticKeyword,
    ].includes(modifier.kind))
  }

  function tags(node, name) {
    return ts.getJSDocTags(node).filter(tag => tag.tagName.text === name)
      .map(tag => typeof tag.comment === "string" ? tag.comment : "")
  }

  function calls(node) {
    const result = []
    function visit(current) {
      if (ts.isCallExpression(current) && ts.isPropertyAccessExpression(current.expression)
        && current.expression.expression.kind === ts.SyntaxKind.ThisKeyword) result.push(current)
      ts.forEachChild(current, visit)
    }
    visit(node)
    return result
  }

  function property(getter, members) {
    const name = getter.name.getText().replace(/^["']|["']$/g, "")
    const signature = checker.getSignatureFromDeclaration(getter)
    const type = checker.getReturnTypeOfSignature(signature)
    const parts = type.isUnion() ? type.types : [type]
    const nullable = parts.some(part => part.flags & ts.TypeFlags.Null)
    const values = parts.filter(part => part.flags & ts.TypeFlags.StringLiteral).map(part => part.value)
    const number = parts.some(part => part.flags & ts.TypeFlags.NumberLike)
    const array = checker.isArrayType(type) || checker.isTupleType(type)
    const kind = array ? "array" : number ? values.length ? "size" : "number"
      : values.length ? "enum"
        : parts.some(part => part.flags & ts.TypeFlags.BooleanLike) ? "boolean"
          : parts.some(part => part.flags & ts.TypeFlags.StringLike) ? "string" : "object"
    const writable = members.some(member => ts.isSetAccessorDeclaration(member) && member.name.getText() === getter.name.getText() && visible(member))
    const invocation = calls(getter)
    const helper = ["choiceAttribute", "booleanAttribute", "numberAttribute", "hasAttribute", "getAttribute"]
      .map(name => invocation.find(call => call.expression.name.text === name)).find(Boolean)
    const result = {
      name, type: kind, typeName: checker.typeToString(type), readable: true, writable, nullable,
      attribute: helper ? literal(helper.arguments[0]) : null,
      encoding: helper?.expression.name.text === "hasAttribute" ? "presence"
        : helper?.expression.name.text === "booleanAttribute" ? "boolean" : null,
      values, min: null, max: null, exclusiveMin: false, integer: tags(getter, "integer").length > 0,
    }
    if (writable && helper) {
      const method = helper.expression.name.text
      result.default = method === "choiceAttribute" ? literal(helper.arguments[2])
        : method === "booleanAttribute" || method === "numberAttribute" ? literal(helper.arguments[1])
          : method === "hasAttribute" ? false : null
      const returned = getter.body?.statements.find(ts.isReturnStatement)?.expression
      if (method === "getAttribute" && returned && ts.isBinaryExpression(returned)
        && [ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken].includes(returned.operatorToken.kind)) {
        result.default = literal(returned.right)
      }
    }
    const defaults = tags(getter, "default")
    if (defaults.length) {
      if (defaults.length !== 1 || !writable || helper || !array) throw new Error(`@default requires a property-only writable array: ${name}.`)
      const value = JSON.parse(defaults[0])
      if (!Array.isArray(value) || value.length) throw new Error(`Only an explicit empty-array @default is supported: ${name}.`)
      result.default = value
    }
    for (const [tag, key] of [["min", "min"], ["max", "max"], ["minExclusive", "min"]]) {
      const value = tags(getter, tag)[0]
      if (value !== undefined) {
        const number = Number(value)
        if (!Number.isFinite(number)) throw new Error(`Invalid @${tag} on ${name}.`)
        result[key] = number
        if (tag === "minExclusive") result.exclusiveMin = true
      }
    }
    return result
  }

  const generated = []
  for (const family of families) {
    const directory = resolve(root, "src", "components", family)
    const elements = []
    for (const file of (await readdir(directory)).filter(file => file.endsWith(".ts")).sort()) {
      const source = program.getSourceFile(resolve(directory, file))
      if (!source) throw new Error(`Source is not in the TypeScript program: ${family}/${file}`)
      for (const node of source.statements) {
        if (!ts.isClassDeclaration(node) || !node.name) continue
        const tag = node.members.find(member => ts.isPropertyDeclaration(member) && member.name.getText() === "tag"
          && member.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.StaticKeyword))
        if (!tag) continue
        const properties = node.members.filter(member => ts.isGetAccessorDeclaration(member) && visible(member))
          .map(member => property(member, node.members))
        const events = new Map()
        for (const call of calls(node)) {
          if (call.expression.name.text !== "emit" || !ts.isStringLiteral(call.arguments[0])) continue
          const web = call.arguments[0].text
          const event = { name: web.replace(/^m:/, "").replace(/(^|-)([a-z])/g, (_, __, letter) => letter.toUpperCase()),
            web, bubbles: true, cancelable: false, composed: false }
          const options = call.arguments[2]
          if (options) {
            if (!ts.isObjectLiteralExpression(options)) throw new Error(`Event flags must be explicit for ${web}.`)
            for (const option of options.properties) {
              if (!ts.isPropertyAssignment(option) || !["bubbles", "cancelable", "composed"].includes(option.name.getText())) throw new Error(`Invalid event flags for ${web}.`)
              event[option.name.getText()] = literal(option.initializer)
            }
          }
          if (call.typeArguments?.[0]) {
            const detail = checker.getTypeFromTypeNode(call.typeArguments[0])
            event.detail = Object.fromEntries(detail.getProperties().map(symbol => [
              symbol.name, checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, call)),
            ]))
          }
          events.set(web, event)
        }
        const regions = tags(node, "region").map(value => {
          const region = JSON.parse(value)
          if (typeof region.name !== "string" || !Array.isArray(region.accepts)
            || !Number.isSafeInteger(region.min) || region.min < 0
            || region.max !== null && (!Number.isSafeInteger(region.max) || region.max < region.min)) {
            throw new Error(`Invalid @region on ${node.name.text}.`)
          }
          return region
        })
        elements.push({
          type: node.name.text, web: { primary: literal(tag.initializer) },
          properties: Object.fromEntries(properties.map(property => [property.name, property])),
          regions, events: [...events.values()], capabilities: [],
          actions: node.members.filter(member => ts.isMethodDeclaration(member) && visible(member)
            && !["connectedCallback", "disconnectedCallback", "attributeChangedCallback"].includes(member.name.getText()))
            .map(member => member.name.getText()),
          states: properties.find(property => property.name === "state")?.values ?? tags(node, "states").flatMap(value => value.split(/\s+/)),
          source: relative(root, source.fileName).split(sep).join("/"),
        })
      }
    }
    const data = { generatedFrom: "TypeScript source; documentation only", elements }
    const output = resolve(root, "demo", "api", `${family}.json`)
    const text = JSON.stringify(data, null, 2) + "\n"
    await mkdir(resolve(root, "demo", "api"), { recursive: true })
    let existing
    try { existing = await readFile(output, "utf8") }
    catch (error) { if (error.code !== "ENOENT") throw error }
    if (existing !== text) await writeFile(output, text)
    generated.push(data)
  }
  return generated
}
