import { serveStatic } from 'hono/bun'
import { Hono } from 'hono'

const app = new Hono()

// Serve static files from frontend build
app.use('/*', serveStatic({ root: '../frontend/build' }))

const port = 3000
console.log(`Server is running on port ${port}`)

export default {
  port,
  fetch: app.fetch
}
