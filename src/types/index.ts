import { Prisma } from "../generated/prisma/client";

export type UserDataType = {
    id: String;
    name: String;
    email: String;
    active: Boolean;
    createdAt: String;
    updatedAt: String;
    role: String | null,
    modules: { id: Number, name: String }[]
}

export type UserWithRelations = Prisma.UserGetPayload<{
    include: {
        platform_modules: { select: {platform_module: true}},
        roles: { select: { role: true } }
    }
}>
