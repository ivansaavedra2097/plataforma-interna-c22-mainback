import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import { app } from "../../src";
import { prisma } from "../../src/prisma/db";

interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    updatedAt: string;
    createdAt: string;
}

const userMock = {
    id: 'asdfasgasgdasdg',
    name: 'admin',
    email: 'admin@mail.com',
    password: '$argon2id$v=19$m=65536,t=2,p=1$IP8YQK3bj+rVSN9X+p3wuED4HMgk4Krrh11IQavTET0$8j35uS27mxbKLFRbTt7ppvU6YNOuCZbv2l5rjP2NjVE',
    createdAt: '2026-07-14 05:15:01.616',
    updatedAt: '2026-07-14 05:15:01.616'
}

interface ResponseLoginFail {
    value: Response;
}

describe('Test api/auth endpoint', () => {

    mock.module("../../src/prisma/db", () => ({
        prisma: {
            user: {
                findUnique: mock(({ where: { email } }) => Promise.resolve(
                    email === userMock.email ? userMock : null
                ))
            }
        }
    }));

    const appHandlerSpy = spyOn(app, 'handle');

    afterEach(() => {
        mock.clearAllMocks();
    });

    const baseUrl = 'http://localhost:3000/api/auth';
    const email = userMock.email;
    const password = "123456";

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

        test('Should Logout successfully',async  () => {
            const response = await app.handle(new Request(logoutPath));

            const cookies: any = response.headers.get('set-cookie');

            expect(cookies).toBeNull();
            expect(appHandlerSpy).toHaveBeenCalled();
            expect(appHandlerSpy).toHaveBeenCalledTimes(1);
        });
    })

});