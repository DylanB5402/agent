import "dotenv/config";
import { Agent } from "@earendil-works/pi-agent-core";
import { getModel } from "@earendil-works/pi-ai";

const agent = new Agent({
    initialState: {
        systemPrompt: "You are a helpful assistant.",
        model: getModel("opencode", "deepseek-v4-flash-free"),
    },
});

agent.subscribe((event) => {
    process.stdout.write(JSON.stringify(event));
});

await agent.prompt("Hello!");