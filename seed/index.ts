import { password } from "bun";
import { prisma } from "../src/prisma/db";

const seedAdmins = [
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

const seedUsers = Array.from({ length: 53 }, (_, index) => {
    const strIndex = `${index}`.padStart(3, '0');
    return {
        name: `user_${strIndex}`,
        password: '123456',
        email: `user_${strIndex}@mail.com`
    }
});

const seedRoles = [
    { name: 'ADMIN', description: 'Rol con permisos universales' },
    { name: 'USER', description: 'Rol temporal' }
]

const usersWithHashedPassword = [...seedAdmins, ...seedUsers].map(user => ({
    ...user,
    password: Bun.password.hashSync(user.password)
}));

const main = async () => {
    console.log('Seeding database...');
    try {
        console.group('Deleting databases...');
        await prisma.userPlatformModule.deleteMany();
        await prisma.userRole.deleteMany();
        await prisma.platformModule.deleteMany();
        await prisma.role.deleteMany();
        await prisma.user.deleteMany();
        console.groupEnd();
        console.group('Seed...');

        const platformModules = await prisma.platformModule.createManyAndReturn({
            data: [
                { name: 'MDULO_01', description: 'Modulo 01 de prueba' },
                { name: 'MDULO_02', description: 'Modulo 02 de prueba' },
                { name: 'MDULO_03', description: 'Modulo 03 de prueba' }
            ]
        })

        const roles = await prisma.role.createManyAndReturn({
            data: seedRoles
        });

        const users = await prisma.user.createManyAndReturn({
            data: usersWithHashedPassword
        });

        users.forEach(async (user) => {
            await prisma.userRole.create({
                data: { user_id: user.id, role_id: user.name.includes('admin') ? roles[0].id : roles[1].id }
            })

            await prisma.userPlatformModule.create({
                data: { user_id: user.id, platform_module_id: user.name.includes('admin') ?platformModules[0].id: platformModules[1].id }
            })
        });

        console.groupEnd();
    } catch (error) {
        console.error('Error: ', error)
    } finally {
        console.log('Process finished.')
    }
}

main();