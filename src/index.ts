import { Elysia } from "elysia";
import api from "./api";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .use(api)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
