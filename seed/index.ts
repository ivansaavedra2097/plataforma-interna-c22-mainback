import { password } from "bun";
import { prisma } from "../src/prisma/db";

const seedUsers = [
    {
        name: 'admin_01',
        password: '123456',
        email: 'admin_01@email.com'
    },
    {
        name: 'admin_02',
        password: '123456',
        email: 'admin_02@email.com'
    }
];

const usersWithHashedPassword = seedUsers.map( user => ({
    ...user,
    password: Bun.password.hashSync(user.password)
}));

const main = async () => {
    console.log('Seeding database...');
    try {
        console.group('Deleting databases...');
        await prisma.userPlatformModule.deleteMany();
        await prisma.userRole.deleteMany();
        await prisma.role.deleteMany();
        await prisma.user.deleteMany();
        console.groupEnd();
        console.group('Seed...');
        await prisma.user.createMany({
            data: usersWithHashedPassword
        });
        console.groupEnd();
    } catch (error) {
        console.error('Error: ', error)
    } finally {
        console.log('Process finished.')
    }
}

main();