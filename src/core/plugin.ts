export interface MuiPlugin<TApi> {
  readonly name: string
  readonly install: (api: TApi) => void
}

const installedPlugins = new Set<string>()

export function installPlugin<TApi>(plugin: MuiPlugin<TApi>, api: TApi): boolean {
  const name = plugin.name.trim()
  if (!name) throw new Error("Plugin name is required.")
  if (installedPlugins.has(name)) return false
  installedPlugins.add(name)
  try {
    plugin.install(api)
  } catch (error) {
    installedPlugins.delete(name)
    throw error
  }
  return true
}

export function isPluginInstalled(name: string): boolean {
  return installedPlugins.has(name)
}
