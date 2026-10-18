import { HttpContextToken } from '@angular/common/http';

/** Lets a request skip the auth interceptor, e.g. the token endpoint. */
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);
