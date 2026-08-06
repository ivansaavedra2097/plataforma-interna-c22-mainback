import { t, UnwrapSchema } from "elysia";

export const UserModelBody = {
    listUsers: t.Object({
        page: t.Integer(),
        pageSize: t.Integer(),
        active: t.Union([
            t.Null(),
            t.Boolean()
        ])
    }),

    createUser: t.Object({
        name: t.String(),
        surname: t.String(),
        email: t.String({ format: "email" }),
        password: t.String(),
        phone_numbers: t.Array(t.String({ minLength: 10, maxLength: 10 })),
        roles: t.Array(t.Number())
    })
} as const;

export const UserModelValidation = {
    listUsers: {
        body: t.Object({
            page: t.Optional(t.Integer()),
            pageSize: t.Optional(t.Integer()),
            active: t.Union([
                t.Null(),
                t.Boolean()
            ])
        }),
        cookie: t.Cookie({ auth: t.Optional(t.String()) }),
        user: t.Object({
            id: t.String()
        })
    },
    createUser: {
        body: t.Object({
            name: t.String(),
            surname: t.String(),
            email: t.String({ format: "email" }),
            password: t.String(),
            phone_numbers: t.Array(t.String({ minLength: 10, maxLength: 10 })),
            roles: t.Array(t.Number())
        }),
        cookie: t.Cookie({ auth: t.Optional(t.String()) })
    }
}

export type UserModelBody = {
    [k in keyof typeof UserModelBody]: UnwrapSchema<typeof UserModelBody[k]>
}