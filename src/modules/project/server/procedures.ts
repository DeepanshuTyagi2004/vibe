import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { consumeCredits } from "@/lib/usage";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { generateSlug } from "random-word-slugs";
import z from "zod";

export const projectRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({
      id: z.string().min(1, { message: "Project ID is required." }).max(1000, { message: "Project ID is too long." }),
    }))
    .query(async ({ input, ctx }) => {
      const existingProject = await prisma.project.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId
        }
      });
      if (!existingProject) {
        throw new TRPCError({code: "NOT_FOUND", message: "Project not found!!"})
      }
      return existingProject;
    }),

  getMany: protectedProcedure
    .query(async ({ ctx }) => {

      const projects = await prisma.project.findMany({
        where: {
          userId: ctx.auth.userId
        },
        orderBy: {
          updatedAt: "desc"
        }
      });

      return projects;
    }),
  create: protectedProcedure
    .input(z.object({
      value: z.string().min(1, { message: "Message is required." }).max(1000, { message: "Message is too long." }),
      
    }))
    .mutation(async ({ input, ctx }) => {
      const createdProject = await prisma.project.create({
        data: {
          userId: ctx.auth.userId,
          name: generateSlug(2, {
            format: "kebab"
          }),
          messages: {
            create: {
              content: input.value,
              role: "USER",
              type: "RESULT"
            }
          }
        }
      });

      try {
        await consumeCredits();
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Something went wrong!" });
        } else {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "You ran out of credits!"
          })
        }
      }

      await inngest.send({
        name: "code-agent/run",
        data: {
          value: input.value,
          projectId: createdProject.id
        }
      });

      return createdProject;
    }),
})