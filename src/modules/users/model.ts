import { t, UnwrapSchema } from "elysia";

export const UserModelBody = {
    listUsers: t.Object({
        page: t.Integer(),
        pageSize: t.Integer()
    })
} as const;

export const UserModelValidation = {
    listUsers: {
        body: t.Object({
            page: t.Optional( t.Integer()),
            pageSize: t.Optional( t.Integer()),
        }),
        cookie: t.Cookie({ auth: t.Optional( t.String())})
    }
}

export type UserModelBody = {
    [k in keyof typeof UserModelBody]: UnwrapSchema<typeof UserModelBody[k]>
}