import { afterEach, beforeAll, describe, expect, Mock, mock, setSystemTime, spyOn, test } from "bun:test";
import { app } from "../../src";
import { AUTH_MOCKS, UserMock, ValidationCodeMock } from "./mocks/auth";
import { authJwt } from "../../src/api/auth";

const userMock = {
    id: 'asdfasgasgdasdg',
    name: 'admin',
    email: 'admin@mail.com',
    password: '$argon2id$v=19$m=65536,t=2,p=1$IP8YQK3bj+rVSN9X+p3wuED4HMgk4Krrh11IQavTET0$8j35uS27mxbKLFRbTt7ppvU6YNOuCZbv2l5rjP2NjVE',
    createdAt: '2026-07-14 05:15:01.616',
    updatedAt: '2026-07-14 05:15:01.616'
}

describe('Test api/auth endpoint', () => {

    //*PRISMA MOCK
    mock.module("../../src/prisma/db", () => ({
        prisma: {
            user: {
                findUnique: UserMock.findUnique,
                update: UserMock.update
            },
            userValidationCode: {
                findUnique: ValidationCodeMock.findUnique,
                delete: ValidationCodeMock.delete,
                create: ValidationCodeMock.create,
                findFirst: ValidationCodeMock.findFirst
            }
        }
    }));

    //*FUNCTIONS MOCK
    const secureSixDigitNumberMock = mock(() => AUTH_MOCKS.recoverNumber);

    mock.module("../../src/utils/secureSixDigitNumber.ts", () => ({
        secureSixDigitNumber: secureSixDigitNumberMock
    }));

    const sendMailMock = mock();

    mock.module("../../src/utils/sendMail.ts", () => ({
        sendMail: sendMailMock
    }));

    const appHandlerSpy = spyOn(app, 'handle');

    afterEach(() => {
        mock.clearAllMocks();
    });

    const baseUrl = 'http://localhost:3000/api/auth';
    const email = userMock.email;
    const password = "123456";

    beforeAll(() => {
        setSystemTime(new Date("2020-01-01T00:00:00.000Z"));
    });



    describe('api/auth/login path', () => {

        const loginPath = `${baseUrl}/login`

        const loginInvalidResponse = "Invalid email or password"

        test('Login successfull', async () => {

            const response = await app.handle(new Request(loginPath, {
                body: JSON.stringify({ email, password }),
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                }
            }));

            const cookies: any = response.headers.get('set-cookie')?.split(';');

            expect(cookies[0]).toContain('auth=');

            const jsonResponse = await response.json();

            expect(response.status).toBe(200);
            expect(jsonResponse).toBeObject();
            expect(jsonResponse.data).toBeObject();
            expect(jsonResponse.token).toBeString();
            expect(jsonResponse.success).toBeTrue();
            expect(jsonResponse.data).toContainAllKeys([
                'id', 'name', 'email', 'createdAt', 'updatedAt'
            ]);
            expect(jsonResponse.data).not.toContainKey('password');
        });

        test('Should Login fail with wrong email', async () => {

            const wrongEmail = "wrongemail@mail.com";

            const response = await app.handle(new Request(loginPath, {
                body: JSON.stringify({ email: wrongEmail, password }),
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                }
            }));

            const responseJson = await response.json();

            expect(response.status).toBe(400);
            expect(responseJson.success).toBeFalse();
            expect(responseJson.error.message).toBe(loginInvalidResponse);
            expect(appHandlerSpy).toHaveBeenCalled();
            expect(appHandlerSpy).toHaveBeenCalledTimes(1);
        });

        test('Shoul Login fail with wrong password', async () => {

            const wrongPassword = "not-the-password";

            const response = await app.handle(new Request(loginPath, {
                body: JSON.stringify({ email, password: wrongPassword }),
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                }
            }));

            const responseJson = await response.json();

            expect(response.status).toBe(400);
            expect(responseJson.success).toBeFalse();
            expect(responseJson.error.message).toBe(loginInvalidResponse);
            expect(appHandlerSpy).toHaveBeenCalled();
            expect(appHandlerSpy).toHaveBeenCalledTimes(1);
        });

        //TODO add email format validation
    });

    describe('api/auth/logout path', () => {

        const logoutPath = `${baseUrl}/logout`;

        test('Should Logout read auth cookie', async () => {

            const response = await app.handle(new Request(logoutPath, {
                headers: { 'Cookie': 'auth=asdffgdhsgdh' }
            }));

            const cookies: any = response.headers.get('set-cookie');

            expect(cookies).toContain('auth=');
            expect(appHandlerSpy).toHaveBeenCalled();
            expect(appHandlerSpy).toHaveBeenCalledTimes(1);
        });

        test('Should Logout successfully', async () => {
            const response = await app.handle(new Request(logoutPath));

            const cookies: any = response.headers.get('set-cookie');

            expect(cookies).toBeNull();
            expect(appHandlerSpy).toHaveBeenCalled();
            expect(appHandlerSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('api/auth/generate-recovery-code path', () => {

        const generateRecoveryCodePath = `${baseUrl}/generate-recovery-code`;

        test('Should generate-recovery-code resolve successfully', async () => {
            sendMailMock.mockResolvedValue(true);

            const response = await app.handle(new Request(generateRecoveryCodePath, {
                body: JSON.stringify({ email: AUTH_MOCKS.email }),
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                }
            }));

            const responseJson = await response.json();

            expect(response.status).toBe(200);
            expect(responseJson.success).toBeTrue();
            expect(appHandlerSpy).toHaveBeenCalled();
            expect(appHandlerSpy).toHaveBeenCalledTimes(1);
            expect(sendMailMock).toHaveBeenCalled()
        });

        test('Should fail if wrong email, user not exists', async () => {

            const response = await app.handle(new Request(generateRecoveryCodePath, {
                body: JSON.stringify({ email: "wrong_email@mail.com" }),
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                }
            }));

            const responseJson = await response.json();

            expect(response.status).toBe(400);
            expect(responseJson.success).toBeFalse();
            expect(responseJson.error.message).toBe('Invalid email or password');
            expect(sendMailMock).not.toHaveBeenCalled();
        });

        test('Should response 500 if sendMail fail', async () => {

            sendMailMock.mockResolvedValue(false);

            const response = await app.handle(new Request(generateRecoveryCodePath, {
                body: JSON.stringify({ email: AUTH_MOCKS.email }),
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                }
            }));

            const responseJson = await response.json();

            expect(response.status).toBe(500);
            expect(responseJson.success).toBeFalse();
            expect(responseJson.error.message).toBe('Error at sending recover password code');
        });

    });

    describe('api/auth/validate-recovery-code path', () => {

        test('Should validate-recovery-code successfully', async () => {
            const response = await app.handle(new Request(AUTH_MOCKS.API_PATHS.VALIDATE_RECOVER_CODE, {
                body: JSON.stringify({ code: String(AUTH_MOCKS.recoverNumber), email: AUTH_MOCKS.email }),
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': AUTH_MOCKS.authCookie
                }
            }));

            const cookies = response.headers.get('set-cookie');

            const responseJson = await response.json();

            expect(response.status).toBe(200);
            expect(cookies).toContain('recoverToken=');
            expect(responseJson.success).toBeTrue();
        });

        test('Should return 404 if user not found, wrong email', async () => {
            const response = await app.handle(new Request(AUTH_MOCKS.API_PATHS.VALIDATE_RECOVER_CODE, {
                body: JSON.stringify({ code: String(AUTH_MOCKS.recoverNumber), email: 'wrongemail@mail.com' }),
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': AUTH_MOCKS.authCookie
                }
            }));

            const responseJson = await response.json();

            expect(response.status).toBe(404);
            expect(responseJson.success).toBeFalse();
            expect(responseJson.error.message).toBe('El código expiró o es incorrecto');
        });

        test('Should return 404 if the verification code is wrong doesnt exists', async () => {
            const response = await app.handle(new Request(AUTH_MOCKS.API_PATHS.VALIDATE_RECOVER_CODE, {
                body: JSON.stringify({ code: String(987653), email: AUTH_MOCKS.email }),
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': AUTH_MOCKS.authCookie
                }
            }));

            const responseJson = await response.json();

            expect(response.status).toBe(404);
            expect(responseJson.success).toBeFalse();
            expect(responseJson.error.message).toBe('El código expiró o es incorrecto');
        });
    });

    describe('api/auth/recover-password path', () => {

        test('Should recover password success', async () => {
            const token = await authJwt.decorator.authJwt.sign({ value: AUTH_MOCKS.user.id, exp: '5m' });

            const response = await app.handle(new Request(AUTH_MOCKS.API_PATHS.RECOVER_PASSWORD, {
                body: JSON.stringify({ password: '1234567', repassword: '1234567' }),
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': `${AUTH_MOCKS.COOKIES.RECOVER_TOKEN}${token}`
                }
            }));

            const cookies = response.headers.get('set-cookie');

            const responseJson = await response.json();

            const recievedUser = { ...responseJson.data }
            delete recievedUser.password;

            expect(response.status).toBe(200);
            expect(responseJson.success).toBeTrue();
            expect(responseJson.data).toEqual(recievedUser);
            expect(cookies).toContain('auth=');
        });

        test('Should send 408 if recoverToken cookie not exists', async () => {

            const response = await app.handle(new Request(AUTH_MOCKS.API_PATHS.RECOVER_PASSWORD, {
                body: JSON.stringify({ password: '1234567', repassword: '1234567' }),
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                }
            }));

            const responseJson = await response.json();

            expect(response.status).toBe(408);
            expect(responseJson.success).toBeFalse();
            expect(responseJson.error.message).toBe('El código expiró o es incorrecto');
        });

        test('Should fail if both passwords are not equal', async () => {
            const token = await authJwt.decorator.authJwt.sign({ value: AUTH_MOCKS.user.id, exp: '5m' });

            const response = await app.handle(new Request(AUTH_MOCKS.API_PATHS.RECOVER_PASSWORD, {
                body: JSON.stringify({ password: '1234590', repassword: '1234567' }),
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': `${AUTH_MOCKS.COOKIES.RECOVER_TOKEN}${token}`
                }
            }));

            const responseJson = await response.json();

            expect(response.status).toBe(400);
            expect(responseJson.success).toBeFalse();
            expect(responseJson.error.message).toBe('Las contraseñas no coinciden');
        });
    })
});