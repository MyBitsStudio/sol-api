import { PrismaClient } from '@prisma/client/edge'
import {withAccelerate} from "@prisma/extension-accelerate";

let prisma: PrismaClient

// eslint-disable-next-line prefer-const
// @ts-ignore
prisma = new PrismaClient().$extends(withAccelerate())

void prisma.$connect()

export { prisma }
