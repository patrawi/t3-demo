import { clerkClient } from "@clerk/nextjs";
import type { Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helper/filterUserForClient";


export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take : 100,
      orderBy : {
        createdAt : 'desc'
      }
    });
    const users = (await clerkClient.users.getUserList({
      userId : posts.map((post) => post.authorId),
      limit : 100,
    })).map(filterUserForClient)
    return posts.map((post : Post) => {
      const author =users.find((user) => user.id === post.authorId)
      if(!author || !author.username) throw new TRPCError({code : "INTERNAL_SERVER_ERROR", message : "Author not found"})
      return {
        post, 
        author : {
          ... author,
          username: author.username
        }
      }
    }

    )
})
,
create : privateProcedure.input(z.object({
  content : z.string().min(1).max(1000)
})).mutation(async ({ctx,input}) => {
  const authorId = ctx.userId
  const post = await ctx.prisma.post.create({
    data : {
      authorId,
      content:input.content
    }

  })
  return post
})})
