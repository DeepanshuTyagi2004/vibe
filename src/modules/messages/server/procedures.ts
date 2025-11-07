import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";

export const messagesRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(z.object({
      projectId: z.string().min(1, { message: "projectId is required." }).max(1000, { message: "projectId is too long." })
    }))
    .query(async ({ input }) => {
      const allMessages = await prisma.message.findMany({
        where: {
          projectId: input.projectId
        },
        include: {
          fragment: true
        },
        orderBy: {
          updatedAt: "asc"
        }
      });

      return allMessages;
    }),
  create: baseProcedure
    .input(z.object({
      value: z.string().min(1, { message: "Message is required." }).max(1000, { message: "Message is too long." }),
      projectId: z.string().min(1, { message: "projectId is required." }).max(1000, { message: "projectId is too long." })
    }))
    .mutation(async ({ input }) => {
      const createdMessage = await prisma.message.create({
        data: {
          projectId: input.projectId,
          content: input.value,
          role: "USER",
          type: "RESULT"
        }
      });

      await inngest.send({
        name: "code-agent/run",
        data: {
          value: input.value,
          projectId: input.projectId
        }
      });

      return createdMessage;
    }),
})