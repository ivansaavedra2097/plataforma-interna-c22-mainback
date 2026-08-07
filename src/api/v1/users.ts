import Elysia, { status, t } from "elysia";
import { authJwt } from "../auth";
import { UserModelValidation } from "../../modules/users/model";
import { UsersService } from "../../modules/users/service";
import { AuthService } from "../../modules/auth/service";
import { password } from "bun";

export const users = new Elysia()
    .use(authJwt)
    .guard({
        beforeHandle: async ({ cookie: { auth }, authJwt, status }) => {
            const validateToken = await authJwt.verify(auth.value);

            if (!validateToken) {
                return status(401, {
                    success: false,
                    error: { message: 'Tu sesión ha expirado', isSessionExpired: true }
                });
            }
        },
        cookie: t.Cookie({ auth: t.Optional(t.String()) })
    })
    .group('/users', app =>
        app
            .derive(async ({ cookie: { auth }, authJwt }) => {

                const user_id = await authJwt.verify(auth.value);

                return { user_id: user_id.value };
            })
            .get('/', async ({ query: { page = 0, pageSize = 10, active = null } }) => {

                const isActive = active === "false" ? false : true;

                const { pagination, users } = await UsersService.listUsers({
                    page: Number(page),
                    pageSize: Number(pageSize),
                    active: active === null ? null : isActive
                });

                return status(200, {
                    success: true,
                    data: users,
                    pagination
                });

            }, UserModelValidation.listUsers)

            .post('/', async ({ body, user_id }) => {

                const userRoles = await AuthService.getUserRoles({ user_id });

                if (!userRoles.find(item => item.role?.name === "ADMIN")) {
                    return status(401, { success: false, error: { message: "No tienes permisos para realizar esta acción" } });
                }

                const createdUser = await UsersService.createUser(body);

                return status(200, ({
                    success: true,
                    data: createdUser
                }))


            }, UserModelValidation.createUser)

            .delete('/:user_id', async ({ params: { user_id }, user_id: id }) => {

                const userRoles = await AuthService.getUserRoles({ user_id: id });

                if (!userRoles.find(item => item.role?.name === "ADMIN")) {
                    return status(401, { success: false, error: { message: "No tienes permisos para realizar esta acción" } });
                }

                const response = await UsersService.disableUser({ user_id });

                if (!response) {
                    return status(404, { success: false, error: { message: "El usuario no existe o está inactivo" } })
                }

                return status(200, {
                    success: true
                });

            }, UserModelValidation.disableUser)

            .put('/:user_id', async ({ params: { user_id }, user_id: id, body }) => {
                const userRoles = await AuthService.getUserRoles({ user_id: id });

                if (!userRoles.find(item => item.role?.name === "ADMIN")) {
                    return status(401, { success: false, error: { message: "No tienes permisos para realizar esta acción" } });
                }

                const updatedUser = await UsersService.updateUser({ user_id, ...body });

                if (!updatedUser) {
                    return status(404, { success: false, error: { message: "El usuario no existe o está inactivo" } })
                }

                return status(200, {
                    success: true,
                    data: updatedUser
                })

            }, UserModelValidation.updateUser)

            .patch('/:user_id/reset-password', async ({ user_id: id, body: { password, repassword }, params: { user_id } }) => {
                const userRoles = await AuthService.getUserRoles({ user_id: id });

                if (!userRoles.find(item => item.role?.name === "ADMIN")) {
                    return status(401, { success: false, error: { message: "No tienes permisos para realizar esta acción" } });
                }

                const updatedUser = await AuthService.recoverPassword({ password, repassword, user_id });

                return status(200, { 
                    success: true,
                    data: updatedUser
                });

            }, UserModelValidation.resetPasswordUser )

            .patch('/:user_id/profile_pic', ({ params: { user_id } }) => `Añadiendo foto de perfil ${user_id}`)
    )
