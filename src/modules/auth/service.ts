import { status } from "elysia";
import { prisma } from "../../prisma/db";
import { AuthModel } from "./model";
import { secureSixDigitNumber } from "../../utils/secureSixDigitNumber";
import { sendMail } from "../../utils/sendMail";
import { _normalizeUserData } from "../normalize/user";

export class AuthService {
    static async login({ email, password }: AuthModel['loginBody']) {

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            throw status(400, {
                success: false,
                error: { message: `Invalid email or password` satisfies AuthModel['loginInvalid'] }
            });
        }

        const isValidPassword = Bun.password.verifySync(`${password}`, user.password);

        if (!isValidPassword) {
            throw status(400, {
                success: false,
                error: { message: `Invalid email or password` satisfies AuthModel['loginInvalid'] }
            });
        }

        return _normalizeUserData( user );
    }

    static async generateRecoverCode({ email }: AuthModel['generateRecoverCodeBody']) {

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            throw status(400, {
                success: false,
                error: { message: 'Invalid email or password' satisfies AuthModel['generateRecoverCodeInvalid'] }
            })
        }

        const recoverNumber = secureSixDigitNumber();

        const existingValidationCode = await prisma.userValidationCode.findUnique({
            where: { user_id: user.id }
        });

        if (existingValidationCode) {
            await prisma.userValidationCode.delete({ where: { id: existingValidationCode.id } });
        }

        await prisma.userValidationCode.create({
            data: {
                code: Bun.password.hashSync(String(recoverNumber)),
                user_id: user.id
            }
        });

        const isEmailSended = await sendMail({
            fileName: 'recover-paassword-email',
            subject: 'Recover password code',
            to: user.email,
            vars: { recover_code: recoverNumber }
        });

        if (!isEmailSended) {
            throw status(500, {
                success: false,
                error: { message: 'Error at sending recover password code' }
            });
        }
    }

    static async validateRecoverPasswordCode({ code, email }: AuthModel['validateRecoverPasswordCodeBody']) {

        const validationCode = await prisma.userValidationCode.findFirst({
            where: { user: { email } }
        });

        if (!validationCode) throw status(404, {
            success: false,
            error: { message: 'El código expiró o es incorrecto' }
        });

        const isValid = Bun.password.verifySync(`${code}`, validationCode.code);

        if (!isValid) throw status(404, {
            success: false,
            error: { message: 'El código expiró o es incorrecto' }
        });

        await prisma.userValidationCode.delete({ where: { id: validationCode.id } });

        return { user_id: validationCode.user_id }
    }

    static async recoverPassword({ password, repassword, user_id }: AuthModel['recoverPasswordBody']) {
        const user = await prisma.user.findUnique({
            where: { id: user_id }
        });

        if (!user) throw status(400, {
            success: false,
            error: { message: 'El usuario o el código es incorrecto' }
        });

        if (password !== repassword) {
            throw status(400,{
                success: false,
                error: { message: 'Las contraseñas no coinciden' }
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id: user_id }, data: {
                password: Bun.password.hashSync(password)
            }
        });

        return {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt
        }
    }

    static async getCurrentUser({ user_id }: AuthModel['currentUserBody']) {
        const user = await prisma.user.findUnique({
            where: { id: user_id }
        });

        if (!user) {
            throw status(404, 'No se encontró el usuario');
        }

        return _normalizeUserData(user);
    }
}