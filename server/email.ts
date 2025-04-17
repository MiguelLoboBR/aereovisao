import { Resend } from 'resend';
import { User } from '@shared/schema';
import { storage } from './storage';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY environment variable is not set. Email notifications will not work.');
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('Tentativa de envio de e-mail sem uma API key do Resend');
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Portal do Piloto <onboarding@resend.dev>',
      to: [params.to],
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
    });
    
    if (error) {
      console.error('Erro ao enviar e-mail:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return false;
  }
}

export async function notifyAllUsersAboutNewPost(postTitle: string, postId: number, authorName: string): Promise<number> {
  // Obter todos os usuários
  const users = await storage.listUsers();
  let successCount = 0;

  for (const user of users) {
    // Pular usuários sem e-mail ou o próprio autor
    if (!user.email || user.id === postId) {
      continue;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0057b7; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Portal do Piloto</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e9e9e9; border-top: none;">
          <h2>Novo conteúdo disponível!</h2>
          <p>Olá, ${user.displayName || user.username}!</p>
          <p>Temos um novo conteúdo disponível no Portal do Piloto que pode ser de seu interesse:</p>
          <div style="background-color: #f9f9f9; border-left: 4px solid #0057b7; margin: 20px 0; padding: 15px;">
            <h3 style="margin-top: 0; color: #0057b7;">${postTitle}</h3>
            <p>Publicado por: ${authorName}</p>
          </div>
          <p>Acesse agora mesmo o Portal do Piloto para conferir este e outros conteúdos!</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.PUBLIC_URL || 'https://638e416f-1ac9-4a64-a3c4-34beb53c4461-00-10we1phtahrjx.worf.replit.dev'}/posts/${postId}" style="background-color: #0057b7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Ver Conteúdo</a>
          </div>
        </div>
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>Este é um e-mail automático do Portal do Piloto. Por favor, não responda.</p>
          <p>Se você não deseja mais receber notificações, acesse suas configurações no portal.</p>
        </div>
      </div>
    `;

    const text = `Novo conteúdo disponível no Portal do Piloto!\n\n
      Olá, ${user.displayName || user.username}!\n
      Temos um novo conteúdo disponível no Portal do Piloto que pode ser de seu interesse:\n
      ${postTitle}\n
      Publicado por: ${authorName}\n\n
      Acesse agora mesmo o Portal do Piloto para conferir este e outros conteúdos!\n
      ${process.env.PUBLIC_URL || 'https://638e416f-1ac9-4a64-a3c4-34beb53c4461-00-10we1phtahrjx.worf.replit.dev'}/posts/${postId}\n\n
      Este é um e-mail automático do Portal do Piloto. Por favor, não responda.
    `;

    const success = await sendEmail({
      to: user.email,
      subject: 'Novo conteúdo disponível no Portal do Piloto',
      html,
      text
    });

    if (success) {
      successCount++;
    }
  }

  return successCount;
}