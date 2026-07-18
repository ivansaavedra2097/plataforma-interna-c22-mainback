import { mock } from "bun:test";

const baseUrl = 'http://localhost:3000';
const password = '123456';
const hashedPassword = Bun.password.hashSync(password);
const user_id = "123e4567-e89b-42d3-a456-426614174000";
const email = 'admin@mail.com';
const recoverNumber = 123456;
const hashedRecoverNumber = Bun.password.hashSync(String(recoverNumber));
const authCookie = 'auth='
const recoverTokenCookie = 'recoverToken='

export const AUTH_MOCKS = {
    authCookie,
    user_id,
    email,
    password,
    hashedPassword,
    user: {
        id: user_id,
        name: 'admin',
        email,
        password: hashedPassword,
        createdAt: '2026-07-14 05:15:01.616',
        updatedAt: '2026-07-14 05:15:01.616'
    },
    recoverNumber,
    validationCode: {
        id: 1,
        code: hashedRecoverNumber,
        user_id
    },
    BASE_URL: baseUrl,
    API_PATHS: {
        GENERATE_RECOVER_CODE: `${baseUrl}/api/auth/generate-recovery-code`,
        VALIDATE_RECOVER_CODE: `${baseUrl}/api/auth/validate-recovery-code`,
        RECOVER_PASSWORD: `${baseUrl}/api/auth/recover-password`,
    },
    COOKIES: {
        AUTH: authCookie,
        RECOVER_TOKEN: recoverTokenCookie
    }
};

export const ValidationCodeMock = {
    findUnique: mock(({ where: { user_id } }) => {
        if (user_id === AUTH_MOCKS.user_id) {
            return Promise.resolve(AUTH_MOCKS.validationCode)
        }
        return Promise.resolve(null);
    }),

    create: mock(({ data: { code, user_id } }) => Promise.resolve()),

    delete: mock(({ where: { id } }) => {
        if (id === AUTH_MOCKS.validationCode.id) {
            return Promise.resolve(AUTH_MOCKS.validationCode)
        }
    }),

    findFirst: mock(({ where: { user: { email } } }) => {
        if (email === AUTH_MOCKS.email) {
            return Promise.resolve(AUTH_MOCKS.validationCode);
        }
        return Promise.resolve(null);
    }),
}

export const UserMock = {
    findUnique: mock(({ where: { email, id } }) => {
        if( email && email === AUTH_MOCKS.email ) return Promise.resolve(AUTH_MOCKS.user);
        if( id && id === AUTH_MOCKS.user.id ) {
            return Promise.resolve(AUTH_MOCKS.user)
        }
    }),

    update: mock(({ where: { id }}) => {
        if( id === AUTH_MOCKS.user.id ){
            return Promise.resolve(AUTH_MOCKS.user);
        }
    })
}

export const sendRecoverEmailMockFail = mock(() => false);