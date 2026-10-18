/** Runtime values from assets/env.js; missing ones fall back to dev defaults. */
interface RuntimeEnvironment {
  apiUrl?: string;
  idpIssuer?: string;
  idpClientId?: string;
  idpScope?: string;
}

const runtime: RuntimeEnvironment = (window as { __env?: RuntimeEnvironment }).__env ?? {};

/** API and identity provider settings for this build. */
export const environment = {
  apiUrl: runtime.apiUrl || 'http://localhost:5010',
  auth: {
    issuer: runtime.idpIssuer || 'http://localhost:5008',
    clientId: runtime.idpClientId || 'personal-dashboard-web',
    scope: runtime.idpScope || 'openid profile offline_access',
    /** Dev only, ignored in production builds. */
    skipSignIn: false,
  },
};
