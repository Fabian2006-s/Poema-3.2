export function plantillaRecuperacion(enlace: string): string {
  return `
    <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6;max-width:560px;margin:0 auto;padding:32px 20px">
      <h1 style="font-size:24px;margin:0 0 16px">Restablece tu contraseña</h1>
      <p style="margin:0 0 24px">Recibimos una solicitud para cambiar la contraseña de tu cuenta.</p>
      <a href="${enlace}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:8px">Crear nueva contraseña</a>
      <p style="margin:24px 0 8px">Este enlace vence en 30 minutos.</p>
      <p style="margin:0;color:#475569">Si no solicitaste el cambio, puedes ignorar este mensaje.</p>
    </div>
  `;
}