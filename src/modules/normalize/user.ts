import { format } from "date-fns";
import { es } from "date-fns/locale"
import { User } from "../../generated/prisma/client"

export type UserDataType = {
    id: String;
    name: String;
    email: String;
    active: Boolean;
    createdAt: String;
    updatedAt: String;
}

export const _normalizeUserData = (user: User): UserDataType => {

    const formatedCreatedAt = format(user.createdAt, `dd/MM/yyyy HH:mm:ss`,{
        locale: es
    });

    const formatedUpdatedAt = format(user.createdAt, `dd/MM/yyyy HH:mm:ss`,{
        locale: es
    });

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: formatedCreatedAt,
        updatedAt: formatedUpdatedAt,
        active: user.active
    }
}