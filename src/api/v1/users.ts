import Elysia, { status, t } from "elysia";
import { authJwt } from "../auth";
import { UserModelValidation } from "../../modules/users/model";
import { UsersService } from "../../modules/users/service";
import { AuthService } from "../../modules/auth/service";

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

                const user_id = await authJwt.verify( auth.value );
                
                return { user_id: user_id.value };
            })
            .get('/', async ({ query: { page = 0, pageSize = 10, active = null }}) => {

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

            .post('/', 'creando usuario')
            .delete('/:user_id', ({ params: { user_id } }) => `Eliminando ${user_id}`)
            .put('/:user_id', ({ params: { user_id } }) => `Editando ${user_id}`)
            .patch('/:user_id/profile_pic', ({ params: { user_id } }) => `Añadiendo foto de perfil ${user_id}`)
    )
