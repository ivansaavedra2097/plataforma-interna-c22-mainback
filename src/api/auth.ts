import Elysia, { status, t } from "elysia";
import { AuthService } from "../modules/auth/service";
import jwt from "@elysia/jwt";
import { toDate } from "date-fns";

export const authRoutes = new Elysia()
    .group('/auth', app =>
        app
            .use(
                jwt({
                    name: 'authJwt',
                    secret: process.env.JWT_SECRET!
                })
            )
            .post('/login', async ({ authJwt, body, cookie: { auth }, status }) => {
                const user = await AuthService.login(body)
                const token = await authJwt.sign({ value: user.id });
                auth.value = token;
                return status(200, { user, token });
            }, {
                body: t.Object({ email: t.String(), password: t.String() }),
                cookie: t.Object({ auth: t.Optional(t.String()) })
            })
            .post('/logout', async ({ cookie: { auth } }) => {
                auth.remove();
                return status(200, 'Logout successfully');
            })
            .post('/generate-recovery-code', async ({ body, status }) => {
                await AuthService.generateRecoverCode(body);
                return status(200);
            }, {
                body: t.Object({ email: t.String({ format: "email" }) })
            })
            .post('/validate-recovery-code', async ({ authJwt, body, cookie: { recoverToken } }) => {
                const user_id = await AuthService.validateRecoverPasswordCode(body);
                const jwtRecoverToken = await authJwt.sign({ value: user_id, exp: '5m' });
                recoverToken.value = jwtRecoverToken;
                return status(200);
            }, {
                body: t.Object({ code: t.String(), email: t.String({ format: "email" }) })
            })
            .post('/recover-password', async ({ authJwt, body: { password, repassword }, cookie: { recoverToken, auth }, status }) => {
                const verifiedToken = await authJwt.verify(recoverToken?.value || "");

                if (!verifiedToken) return status(408, 'El código expiró o es incorrecto');

                const user = await AuthService.recoverPassword({ password, repassword, user_id: verifiedToken.value.user_id });

                recoverToken.remove();

                const token = await authJwt.sign({ value: user.id });
                auth.value = token;

                return status(200, { user, token });
            }, {
                body: t.Object({ password: t.String(), repassword: t.String() }),
                cookie: t.Object({ recoverToken: t.Optional(t.String()) })
            })
            .get('/current-user', 'trayendo el current user')
    );