import { prisma } from "../../prisma/db";
import { _normalizeUserData } from "../normalize/user";
import { UserModelBody } from "./model";

const managePagination = (itemCount: number, pageSize: number, actualPage: number) => {

    const totalPages = Math.ceil(itemCount / pageSize);

    const page = (actualPage < 1)
        ? 1
        : (actualPage > totalPages) ? totalPages : actualPage

    return {
        totalElements: itemCount,
        totalPages,
        page,
        pageSize
    }
}

export class UsersService {

    static async listUsers({ page, pageSize }: UserModelBody['listUsers']) {

        const totalUsers = await prisma.user.count();

        const pagination = managePagination(
            totalUsers,
            pageSize,
            page
        );

        const users = await prisma.user.findMany({
            skip: (pagination.page - 1) * pageSize,
            take: pageSize,
            include: {
                roles: { include: { role: true } },
                platform_modules: { include: { platform_module: true } }
            }
        });

        return {
            users: users.map( user => _normalizeUserData( user )),
            pagination
        }

    }
}