import { t, UnwrapSchema } from "elysia";

export const UserModelBody = {
    listUsers: t.Object({
        page: t.Integer(),
        pageSize: t.Integer(),
        active: t.Union([
            t.Null(),
            t.Boolean()
        ])
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
    }
}

export type UserModelBody = {
    [k in keyof typeof UserModelBody]: UnwrapSchema<typeof UserModelBody[k]>
}