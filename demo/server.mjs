import { createReadStream } from "node:fs"
import { stat } from "node:fs/promises"
import { createServer } from "node:http"
import { extname, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)))
const allowedRoots = [
  resolve(packageRoot, "demo"),
  resolve(packageRoot, "dist"),
]
const port = Number.parseInt(process.env.PORT ?? "4173", 10)
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".map": "application/json; charset=utf-8",
}

function resolveRequest(pathname) {
  const relativePath = pathname.slice(1)
  const filePath = resolve(packageRoot, relativePath)
  const allowed = allowedRoots.some(
    (root) => filePath === root || filePath.startsWith(`${root}${sep}`),
  )
  return allowed ? filePath : null
}

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname)
    if (pathname === "/") {
      response.writeHead(302, { Location: "/demo/" }).end()
      return
    }
    let filePath = resolveRequest(pathname)
    if (filePath === null) {
      response.writeHead(404).end("Not found")
      return
    }
    const fileStat = await stat(filePath)
    if (fileStat.isDirectory()) filePath = resolve(filePath, "index.html")
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    })
    createReadStream(filePath).pipe(response)
  } catch (error) {
    const status = error?.code === "ENOENT" ? 404 : 500
    response.writeHead(status).end(status === 404 ? "Not found" : "Server error")
  }
})

server.listen(port, "127.0.0.1", () => {
  console.log(`MarkupUI demo: http://localhost:${port}`)
})
