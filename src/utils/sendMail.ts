import { pathToFileURL } from 'bun';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 1025,
    secure: false,
    tls: { rejectUnauthorized: false },
    auth: {
        user: 'admin',
        pass: 'password'
    }
});

interface SendEmailOptions {
    to: string;
    subject: string;
    fileName: string;
    vars?: object | null;
    from?: string;
}

const getHtmlFileToText = async (emailHtmlFileName: string): Promise<string> => {
    const path = pathToFileURL(`./src/emails/${emailHtmlFileName}.html`);
    return await Bun.file(path).text();
}

const overrideHtmlVarsValues = (strHtml: string, vars: object | null) => {
    if (!vars) return strHtml;
    let overrideHtml = strHtml;
    Object.entries( vars ).forEach(([key, value]) => {
        const strValue = String(value);
        overrideHtml = overrideHtml.replaceAll(`{{${key}}}`,strValue);
    });
    return overrideHtml;
}

export const sendMail = async ({ fileName, to, subject, vars = null, from ='admin@mail.com' }: SendEmailOptions): Promise<boolean> => {
    try {

        let stringHtml = await getHtmlFileToText(fileName);

        if( !stringHtml ) throw new Error('Empty html file or not exists');

        stringHtml = overrideHtmlVarsValues(stringHtml, vars);

        await transporter.sendMail({
            from,
            to,
            subject,
            html: stringHtml
        });

        return true;
    } catch (error) {
        console.error('error al mandar el main', error)
        return false;
    }
}