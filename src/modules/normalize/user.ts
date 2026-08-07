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
    roles: { id: Number, name: String }[]
    modules: { id: Number, name: String }[]
    phone_numbers: { id: Number, phone_number: String }[]
}

export type UserWithRelations = Prisma.UserGetPayload<{
    include: {
        roles: { include: { role: true } },
        platform_modules: { include: { platform_module: true } },
        phone_numbers: true
    }
}>

export const _normalizeUserData = (user: UserWithRelations): UserDataType => {

    const formatedCreatedAt = format(user.createdAt, `dd/MM/yyyy HH:mm:ss`, {
        locale: es
    });

    const formatedUpdatedAt = format(user.updatedAt, `dd/MM/yyyy HH:mm:ss`, {
        locale: es
    });

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: formatedCreatedAt,
        updatedAt: formatedUpdatedAt,
        active: user.active,
        roles: user.roles.map(({ role }) => ({ id: role.id, name: role.name })),
        modules: user.platform_modules.map(module => ({
            id: module.platform_module.id,
            name: module.platform_module.name
        })),
        phone_numbers: user.phone_numbers.map(({ id, phone_number }) => ({ id, phone_number }))
    }
}