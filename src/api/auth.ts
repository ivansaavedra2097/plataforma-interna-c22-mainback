import Elysia, { status, t } from "elysia";
import { AuthService } from "../modules/auth/service";
import jwt from "@elysia/jwt";
import { toDate } from "date-fns";
import { AuthModelValidations } from "../modules/auth/model";

const authJwt = jwt({
    name: 'authJwt',
    secret: process.env.JWT_SECRET!,
    exp: '8h'
});

export const authRoutes = new Elysia()
    .group('/auth', app =>
        app
            .use(authJwt)

            .post('/login', async ({ authJwt, body, cookie: { auth }, status }) => {

                const user = await AuthService.login(body)
                const token = await authJwt.sign({ value: user.id });
                auth.value = token;
                return status(200, { success: true, data: user, token });

            }, AuthModelValidations.login)


            .get('/logout', async ({ cookie }) => {
                if (cookie?.auth) cookie.auth.remove();
                return status(200, { success: true });
            })


            .post('/generate-recovery-code', async ({ body, status }) => {
                await AuthService.generateRecoverCode(body);
                return status(200, { success: true });
            }, AuthModelValidations.generateRecoveryCode)


            .post('/validate-recovery-code', async ({ authJwt, body, cookie: { recoverToken } }) => {
                const user_id = await AuthService.validateRecoverPasswordCode(body);
                const jwtRecoverToken = await authJwt.sign({ value: user_id, exp: '5m' });
                recoverToken.value = jwtRecoverToken;
                return status(200);
            }, AuthModelValidations.validateRecoveryCode)


            .post('/recover-password', async ({ authJwt, body: { password, repassword }, cookie: { recoverToken, auth }, status }) => {
                const verifiedToken = await authJwt.verify(recoverToken?.value || "");

                if (!verifiedToken) return status(408, 'El código expiró o es incorrecto');

                const user = await AuthService.recoverPassword({ password, repassword, user_id: verifiedToken.value.user_id });

                recoverToken.remove();

                const token = await authJwt.sign({ value: user.id });
                auth.value = token;

                return status(200, { user, token });
            }, AuthModelValidations.recoverPassword)


            .get('/current-user', async ({ cookie: { auth }, authJwt }) => {
                const verifiedToken = await authJwt.verify(auth.value);

                if (!verifiedToken) return status(401, 'Expiró la sesión');

                const user = await AuthService.getCurrentUser({ user_id: verifiedToken.value });

                return status(200, { success: true, data: user });

            }, AuthModelValidations.currentUser )
    );