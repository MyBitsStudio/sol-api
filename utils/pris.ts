import { PrismaClient } from "@prisma/client"

let prisma: PrismaClient

// eslint-disable-next-line prefer-const
prisma = new PrismaClient()

void prisma.$connect()

export { prisma }
