import { format } from "date-fns";
import { es } from "date-fns/locale"
import { Prisma } from "../../generated/prisma/client"

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
        roles: { include: { role: true } },
        platform_modules: { include: { platform_module: true } }
    }
}>

export const _normalizeUserData = (user: UserWithRelations): UserDataType => {

    let role = null;

    const formatedCreatedAt = format(user.createdAt, `dd/MM/yyyy HH:mm:ss`, {
        locale: es
    });

    const formatedUpdatedAt = format(user.createdAt, `dd/MM/yyyy HH:mm:ss`, {
        locale: es
    });

    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
        role = user.roles[0].role.name
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: formatedCreatedAt,
        updatedAt: formatedUpdatedAt,
        active: user.active,
        role,
        modules: user.platform_modules.map(module => ({
            id: module.platform_module.id,
            name: module.platform_module.name
        }))
    }
}