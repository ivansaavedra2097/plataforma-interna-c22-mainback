import { Elysia } from "elysia";
import api from "./api";
import cors from "@elysia/cors";

export const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .use(cors({
    origin: [process.env.FRONTEND_APP_UR || "http://localhost:5173"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }))
  .use(api)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
