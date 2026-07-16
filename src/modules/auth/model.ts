import { t, UnwrapSchema } from "elysia";

export const AuthModel = {
    loginBody: t.Object({
        email: t.String({ format: "email" }),
        password: t.String()
    }),
    loginResponse: t.Object({
        user: t.Object({
            id: t.String(),
            name: t.String(),
            email: t.String(),
            created_at: t.String(),
            updated_at: t.String()
        }),
        token: t.String()
    }),
    loginInvalid: t.Literal('Invalid email or password'),
    generateRecoverCodeBody: t.Object({
        email: t.String({ format: "email" })
    }),
    generateRecoverCodeResponse: t.Literal('Success'),
    generateRecoverCodeInvalid: t.Literal('Invalid email or password'),
    validateRecoverPasswordCodeBody: t.Object({ code: t.String(), email: t.String({ format: "email" }) }),
    recoverPasswordBody: t.Object({ password: t.String(), repassword: t.String(), user_id: t.String()})
} as const

export type AuthModel = {
	[k in keyof typeof AuthModel]: UnwrapSchema<typeof AuthModel[k]>
}