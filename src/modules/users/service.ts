import { status } from "elysia";
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

    static async listUsers({ page, pageSize, active }: UserModelBody['listUsers']) {

        const users = await prisma.user.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
            where: (active === null ? ({}): { active }),
            include: {
                roles: { include: { role: true } },
                platform_modules: { include: { platform_module: true } },
                phone_numbers: true
            }
        });

        const pagination = managePagination(
            users.length,
            pageSize,
            page
        );

        return {
            users: users.map( user => _normalizeUserData( user )),
            pagination
        }

    }
    
    static async createUser({ name, surname, email, password, roles, phone_numbers }:UserModelBody['createUser'] ){

        const hashedPassword = Bun.password.hashSync(password);

        const user = await prisma.user.create({
            data: { 
                name, 
                surname, 
                email, 
                active: true,
                password: hashedPassword,
                phone_numbers: {
                    createMany: {
                        data: phone_numbers.map( num => ({
                            phone_number: num
                        }))
                    }
                },
                roles: {
                    create: roles.map( role_id => ({ role_id }))
                }
            },
            include: {
                phone_numbers: true,
                platform_modules: { include: { platform_module: true }},
                roles: { include: { role: true }}
            }
        });

        //TODO email para informar que el usuario ha sido creado con link a la plataforma

        return _normalizeUserData( user );
    }

    static async disableUser({ user_id }: UserModelBody['disableUser']) {

        const user = await prisma.user.findUnique({ where: { id: user_id }});
        if( !user || !user?.active ) {
            return false;
        }

        await prisma.user.update({ 
            where: { id: user_id },
            data: { active: false }
        });

        return true;
    }
}