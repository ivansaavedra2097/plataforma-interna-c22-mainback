import Elysia from "elysia";
import { authRoutes } from "./auth";
import { v1 } from "./v1";

const api = new Elysia({ prefix: '/api' })
    .use(authRoutes)
    .use(v1)

export default api;