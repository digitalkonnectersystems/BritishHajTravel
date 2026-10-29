/** Server-side SMTP configuration shared by runtime diagnostics and delivery. */
export type SmtpEnvironment = Record<string, string | undefined>;

export type SmtpRuntimeConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  senderEmail: string;
  issues: string[];
  configured: boolean;
};

const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const HOST_PATTERN = /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/i;

export function getSmtpRuntimeConfig(env: SmtpEnvironment = process.env): SmtpRuntimeConfig {
  const host = String(env.SMTP_HOST || '').trim();
  const user = String(env.SMTP_USER || '').trim();
  const password = env.SMTP_PASS || '';
  const portValue = String(env.SMTP_PORT || '465').trim();
  const port = Number(portValue);
  const secureFlag = String(env.SMTP_SECURE || '').trim().toLowerCase();
  const validSecureFlag = !secureFlag || ['true', 'false', '1', '0', 'yes', 'no'].includes(secureFlag);
  const secure = secureFlag ? ['true', '1', 'yes'].includes(secureFlag) : port === 465;
  const senderEmail = String(env.MAIL_FROM_EMAIL || env.SMTP_FROM || user).trim();
  const issues: string[] = [];

  if (!host || !HOST_PATTERN.test(host) || host.includes('..')) issues.push('SMTP_HOST');
  if (!EMAIL_PATTERN.test(user)) issues.push('SMTP_USER');
  if (!password.trim()) issues.push('SMTP_PASS');
  if (!Number.isInteger(port) || port < 1 || port > 65535) issues.push('SMTP_PORT');
  if (!validSecureFlag) issues.push('SMTP_SECURE');
  if (!EMAIL_PATTERN.test(senderEmail)) issues.push('SMTP_FROM / MAIL_FROM_EMAIL');

  return { host, port, secure, user, password, senderEmail, issues, configured: issues.length === 0 };
}

/** Do not send SMTP passwords or raw auth details to the admin browser. */
export function getPublicSmtpRuntimeStatus(env: SmtpEnvironment = process.env) {
  const config = getSmtpRuntimeConfig(env);
  return {
    configured: config.configured,
    issues: config.issues,
    host: config.host || null,
    port: Number.isInteger(config.port) && config.port > 0 && config.port <= 65535 ? config.port : null,
    encryption: config.secure ? 'SSL/TLS' : 'STARTTLS / provider-dependent',
    user: config.user ? `${config.user.slice(0, 2)}***${config.user.includes('@') ? config.user.slice(config.user.indexOf('@')) : ''}` : null,
    passwordConfigured: Boolean(config.password.trim()),
    checkedAt: new Date().toISOString(),
  };
}
