import { FastifyInstance } from "fastify"
import { prisma } from '../lib/prisma'
import { z  } from 'zod'

export async function memoriesRoute(app: FastifyInstance) {
    app.get('/memories', async () => {
       const memories = prisma.memory.findMany({ 
        orderBy: { createdAt: 'asc',
                 },
              })
       return (await memories).map(memory => {
             return {id: memory.id, 
                     coverUrl: memory.coverUrl,
                     excerpt: memory.content.substring(0, 115).concat('...'),
                    }
                                            })
    })

    app.get('/memories/:id', async (request, reply) => {
                const paramSchema = z.object({
                    id : z.string().uuid(),
                 })
                 const { id } = paramSchema.parse(request.params)
                 const memory = await prisma.memory.findUniqueOrThrow({
                    where : {
                        id,
                    },
                 })
                 return memory
       
    })    

    app.post('/memories', async (request) => {
        const bodySchema = z.object({
          content: z.string(),
          coverUrl: z.string(),
          isPublic: z.coerce.boolean().default(false),
        })
    
        const { content, coverUrl, isPublic } = bodySchema.parse(request.body)
    
        const memory = await prisma.memory.create({
          data: {
            content,
            coverUrl,
            isPublic,
            userId: 'dcc2230a-2a5a-40c1-9c93-eb802c373750', 
          },
        })
    
        return memory
      })    

    
    app.put('/memories/:id', async (request, reply) => {
      const paramsSchema = z.object({
        id: z.string().uuid(),
      })
  
      const { id } = paramsSchema.parse(request.params)
  
      const bodySchema = z.object({
        content: z.string(),
        coverUrl: z.string(),
        isPublic: z.coerce.boolean().default(false),
      })
  
      const { content, coverUrl, isPublic } = bodySchema.parse(request.body)
  
      let memory = await prisma.memory.findUniqueOrThrow({
        where: {
          id,
        },
      })
  
      if (memory.userId !== request.user.sub) {
        return reply.status(401).send()
      }
  
      memory = await prisma.memory.update({
        where: {
          id,
        },
        data: {
          content,
          coverUrl,
          isPublic,
        },
      })
  
      return memory
    })
  






    app.delete('/memories/:id', async (request, reply) => {
      const paramsSchema = z.object({
        id: z.string().uuid(),
      })
  
      const { id } = paramsSchema.parse(request.params)
  
      const memory = await prisma.memory.findUniqueOrThrow({
        where: {
          id,
        },
      })
  
      if (memory.userId !== request.user.sub) {
        return reply.status(401).send()
      }
  
      await prisma.memory.delete({
        where: {
          id,
        },
      })
    })

}