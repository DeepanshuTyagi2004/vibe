import { inngest } from "./client";
import { Sandbox } from '@e2b/code-interpreter';
import { openai, createAgent } from "@inngest/agent-kit";
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-nextjs-deepanshu-1");
      return sandbox.sandboxId;
    });
    const codeWriter = createAgent({
      name: "Code writer",
      system: 'You are an expert Next.js 14+ full-stack developer specializing in the App Router, TypeScript, Tailwind CSS, shadcn/ui, and Server Actions.' +
        'Your job is to generate clean, production-grade Next.js code exactly as a professional developer would — optimized, consistent, and ready to paste into a project.'
      ,
      model: openai({ model: "gpt-4o" }),
    });

    const { output } = await codeWriter.run("Create a Next.js code for: " + event.data.value);

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);

      return `https://${host}`;
    });
    return { output, sandboxUrl };
  },
);