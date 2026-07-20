# Plataforma-interna-c22

## Tools
### Bruno
To test api endpoints we can use different kind of api clients. We're using Bruno:
[Bruno](https://www.usebruno.com/)

## Documentation
[Bun](https://bun.com/docs) 

[Elysia](https://bun.com/docs/guides/ecosystem/elysia)

[Prisma](https://www.prisma.io/docs/guides/runtimes/bun)

## Development
1. clone project
2. Excecute `bun install`
3. Create `.env` from `.env.example`
4. Excecute `bun run dev` or `bun dev`
5. Excecute `bun seed` to seed example database

## ENV
DATABASE_URL="postgresql://`user`:`password`@`host`:`port`/`database name`?schema=public"

## Prisma
run `bunx --bun prisma db push` to read actual schema and update db without generating sql and migration files
run `bunx prisma migrate dev --name add_user_role` to generate a migration with file name
run `bunx prisma generate` to update model types

Open http://localhost:3000/ with your browser to see the result.