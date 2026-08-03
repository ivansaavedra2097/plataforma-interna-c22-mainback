import Elysia, { status, t } from "elysia";
import { authJwt } from "../auth";
import { UserModelValidation } from "../../modules/users/model";
import { UsersService } from "../../modules/users/service";

export const users = new Elysia()
    .group('/users', app =>
        app.use(authJwt)
            .get('/', async ({ query: { page = 0, pageSize = 10 }, cookie: { auth }, authJwt }) => {

                const tokenValidation = authJwt.verify(auth?.value);

                if (!tokenValidation) {
                    return status(401, {
                        success: false,
                        error: { message: 'Tu sesión ha expirado', isSessionExpired: true }
                    });
                }

                const { pagination, users } = await UsersService.listUsers({ 
                    page: Number(page),
                    pageSize: Number(pageSize)
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
