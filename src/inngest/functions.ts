import { inngest } from "./client";
import { Sandbox } from '@e2b/code-interpreter';
import { openai, createAgent, createTool, createNetwork, Tool, type Message, createState } from "@inngest/agent-kit";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import z from "zod";
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/prompt";
import { prisma } from "@/lib/db";

interface AgentState {
  summary: string,
  files: {
    [path: string]: string
  }
}

// export const getTitleFunction = inngest.createFunction(
//   { id: "title-generator" },
//   { event: "title-generator/generate" },
//   async ({ event }) => {
//     const titleGenerator = createAgent({
//       name: "Title Generator",
//       description: "An expert Title Generator for the given Prompt",
//       system: "Given the user prompt, Create a 2-3 words title. The Title should not exceed 2-3 words and should summarize the given user prompt.",
//       model: openai({
//         model: "gpt-4.1",
//         defaultParameters: {
//           temperature: 0.1
//         }
//       }),
//       lifecycle: {
//         onResponse: async ({ result, network }) => {
//           if (network) {
//             const title = result.output;
//             if (title.length > 0) {
//               network.state.data.title = title;
//             }
//           }
//           return result;
//         }
//       }
//     });

//     const network = createNetwork({
//       name: "title-generator-network",
//       maxIter: 15,
//       agents: [titleGenerator],
//     })
//     const result = await network.run(event.data.prompt);
    
//     const isError = !result.state.data.title || result.state.data.title.length == 0;

//     if (isError) {
//       return {
//         title: "Generation Failed"
//       }
//     }
//     return {
//       title: result.state.data.title
//     }

//   }
// );

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-nextjs-deepanshu-1");
      return sandbox.sandboxId;
    });

    const previousMessages = await step.run("get-previous-messages", async () => {
      const formattedMessages: Message[] = [];

      const messages = await prisma.message.findMany({
        where: {
          projectId: event.data.projectId
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      for (const message of messages) {
        formattedMessages.push({
          type: "text",
          role: message.role == "ASSISTANT" ? "assistant" : "user",
          content: message.content
        });
        return formattedMessages;
      }
    }) ?? [];

    const state = createState<AgentState>(
      {
        summary: "",
        files: {}
      },
      {
        messages: previousMessages
      }
    );
    const codeAgent = createAgent<AgentState>({
      name: "Code Agent",
      description: "An expert coding agent",
      system: PROMPT,
      model: openai({
        model: "gpt-5.1",
        defaultParameters: {
          temperature: 0.1
        }
      }),
      tools: [
        createTool({
          name: "Terminal",
          description: "Use the terminal to run commands.",
          parameters: z.object({
            command: z.string()
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffer = { stdout: "", stderr: "" };
              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffer.stdout += data;
                  },
                  onStderr: (err: string) => {
                    buffer.stderr += err;
                  }
                });
                return result.stdout
              } catch (e) {
                console.log(
                  `Command failed: ${e}\nStdout: ${buffer.stdout}\nStderr: ${buffer.stderr}`
                )
                return `Command failed: ${e}\nStdout: ${buffer.stdout}\nStderr: ${buffer.stderr}`;
              }
            });
          }
        }),
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or Update files in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string()
              })
            )
          }),
          handler: async ({ files }, { step, network } : Tool.Options<AgentState>)  => {
            const newFiles = await step?.run("createOrUpdateFiles", async () => {
              try {
                const updatedFiles = network.state.data.files || {};
                const sandbox = await getSandbox(sandboxId);
                for (const file of files) {
                  await sandbox.files.write(file.path, file.content);
                  updatedFiles[file.path] = file.content;
                }
                return updatedFiles;
              } catch (e) {
                return "Error: " + e;
              }
            });

            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          }
        }),
        createTool({
          name: "readFiles",
          description: "Read files from sandbox",
          parameters: z.object({
            files: z.array(z.string())
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content: content });
                }
                return JSON.stringify(contents);
              } catch (e) {
                return "Error: " + e;
              }
            });
          }
        })
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText = lastAssistantTextMessageContent(result);

          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantMessageText;
            }
          }
          return result;
        }
      }
    });

    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      maxIter: 15,
      agents: [codeAgent],
      defaultState: state,
      router: async ({ network }) => {
        const summary = network.state.data.summary;

        if (summary) {
          return;
        }
        return codeAgent;
      }
    })

    const result = await network.run(event.data.value, { state });

    const fragmentTitleGenerator = createAgent<AgentState>({
      name: "Fragment Title Generator",
      description: "Title generator for code fragments",
      system: FRAGMENT_TITLE_PROMPT,
      model: openai({
        model: "gpt-4o",
      }),
    });

    const responseGenerator = createAgent<AgentState>({
      name: "Response Generator",
      description: "Response generator for code fragments",
      system: RESPONSE_PROMPT,
      model: openai({
        model: "gpt-4o",
      }),
    });

    const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(result.state.data.summary);
    const { output: responseOutput } = await responseGenerator.run(result.state.data.summary);

    const generateFragmentTitle = () => {
      if (fragmentTitleOutput[0].type !== "text") {
        return "Fragment";
      }

      if (Array.isArray(fragmentTitleOutput[0].content)) {
        return fragmentTitleOutput[0].content.map((text) => text).join("");
      } else {
        return fragmentTitleOutput[0].content;
      }
    }
    const generateResponse = () => {
      if (responseOutput[0].type !== "text") {
        return "Here you go";
      }

      if (Array.isArray(responseOutput[0].content)) {
        return responseOutput[0].content.map((text) => text).join("");
      } else {
        return responseOutput[0].content;
      }
    }
    const isError = !result.state.data.summary || Object.keys(result.state.data.summary).length == 0;
    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);

      return `https://${host}`;
    });

    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wrong. Please try again.",
            type: "ERROR",
            role: "ASSISTANT"
          }
        })
      }
      await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: generateResponse(),
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandboxUrl: sandboxUrl,
              title: generateFragmentTitle(),
              files: result.state.data.files
            }
          }
        }
      })
    });
    return {
      url: sandboxUrl,
      title: "Fragments",
      files: result.state.data.files,
      summary: result.state.data.summary
    };
  },
);