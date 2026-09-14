export interface WebComponentNames {
  primary: string
}

export interface PlatformComponentDefinition {
  type: string
  web: WebComponentNames
  capabilities: readonly string[]
}
