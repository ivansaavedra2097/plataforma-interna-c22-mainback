import Elysia from "elysia";

export const users = new Elysia()
    .get('/users', 'trayendo users')
    .post('/users', 'creando usuario')
    .delete('/users/:user_id', ({ params: { user_id } }) => `Eliminando ${user_id}`)
    .put('/users/:user_id', ({ params: { user_id } }) => `Editando ${user_id}`)
    .patch('/users/:user_id/profile_pic', ({ params: { user_id } }) => `Añadiendo foto de perfil ${user_id}`)
