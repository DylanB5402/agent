import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { sessions, actions, middleware, pages } from 'astro/hono';

const app = new Hono();

let id = 0

// Setup Astro middleware/handlers in the correct pipeline order
app.use(sessions());
app.use(actions());
app.use(middleware());

app.get('/sse', async (c) => {
  const message = c.req.query('message') || 'Hello'
  return streamSSE(c, async (stream) => {
    const randomNum = Math.floor(Math.random() * 10000)
    const data = `${message} ${randomNum}`
    await stream.writeSSE({
      data,
      event: 'chat-response',
      id: String(id++),
    })
  })
})

app.all('*', pages());

export default app;