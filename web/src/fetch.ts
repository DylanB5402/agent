import "dotenv/config";

import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { sessions, actions, middleware, pages } from 'astro/hono';
import { getModel } from "@earendil-works/pi-ai";
import { Agent } from "@earendil-works/pi-agent-core";

const app = new Hono();

const agent = new Agent({
    initialState: {
        systemPrompt: "You are a helpful assistant.",
        model: getModel("opencode", "deepseek-v4-flash-free"),
    },
});

let id = 0

// Setup Astro middleware/handlers in the correct pipeline order
app.use(sessions());
app.use(actions());
app.use(middleware());

app.get('/sse', async (c) => {
  const message = c.req.query('message') || 'Hello'
  return streamSSE(c, async (stream) => {
    await new Promise<void>((resolve, reject) => {
      const unsub = agent.subscribe(async (event) => {
        console.log(event)
        if (event.type === 'message_update' && event.assistantMessageEvent.type === 'text_delta') {
          await stream.writeSSE({
            data: event.assistantMessageEvent.delta,
            event: 'chat-response',
            id: String(id++),
          })
        }
        if (event.type === 'agent_end') {
          unsub()
          resolve()
        }
      })
      agent.prompt(message).catch(reject)
    })
  })
})

app.all('*', pages());

export default app;