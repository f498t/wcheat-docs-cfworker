import { PrismaClient } from '@prisma/client'
export const login = async (uuid:string, prisma: PrismaClient) => {
    if (uuid && uuid.length > 0){
        const result = await prisma.users.findFirst({
            where:{
                uuid:uuid
            }
        })
        return result
    }
    return null
}