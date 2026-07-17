import { mock } from "bun:test";

const password = '123456';
const hashedPassword = Bun.password.hashSync(password);
const user_id = "123e4567-e89b-42d3-a456-426614174000";
const email = 'admin@mail.com';
const recoverNumber = 123456;
const hashedRecoverNumber = Bun.password.hashSync(String(recoverNumber));

export const AUTH_MOCKS = {
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
    }
};

export const ValidationCodeMock = {
    findUnique: mock(({ where: { user_id } }) => {
        if (user_id === AUTH_MOCKS.user_id) {
            Promise.resolve(AUTH_MOCKS.validationCode)
        }
        Promise.resolve(null);
    }),

    create: mock(({ data: { code, user_id } }) => Promise.resolve()),

    delete: mock(({ where: { id } }) => {
        if (id === AUTH_MOCKS.validationCode.id) {
            Promise.resolve(AUTH_MOCKS.validationCode)
        }
    })
}

export const sendRecoverEmailMockFail = mock(() => false );