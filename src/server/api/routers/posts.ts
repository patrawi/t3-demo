import { clerkClient } from "@clerk/nextjs";
import type { Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helper/filterUserForClient";

const addUserDataToPosts = async (posts: Post[]) => {
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
  )}
export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take : 100,
      orderBy : {
        createdAt : 'desc'
      }
    });


    return addUserDataToPosts(posts)
  }),
getPostsByUserId : publicProcedure.input(z.object({
  userId : z.string()
})).query(async ({ctx, input}) => {
  return ctx.prisma.post.findMany({
    where : {
      authorId : input.userId
    },
    take : 100,
    orderBy : {createdAt : 'desc'}
  }).then(addUserDataToPosts)
})
,
getById: publicProcedure.input(z.object({
  id : z.string()
})).query(async ({ctx, input}) => {
  const post = await ctx.prisma.post.findUnique({
    where : {
      id : input.id
    }
  })
  if (!post) throw new TRPCError({code : 'NOT_FOUND'})
  return (await addUserDataToPosts([post]))[0];
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