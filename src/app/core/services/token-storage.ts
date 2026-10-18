import { Injectable } from '@angular/core';
import { PendingAuthorization } from '../models/auth/auth-models';

const REFRESH_TOKEN_KEY = 'auth.refresh_token';
const PENDING_KEY = 'auth.pending';

/** Keeps the refresh token and pending sign-in in sessionStorage. */
@Injectable({
  providedIn: 'root',
})
export class TokenStorage {
  getRefreshToken(): string | null {
    return this.read(REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token: string | undefined): void {
    if (token) this.write(REFRESH_TOKEN_KEY, token);
    else this.remove(REFRESH_TOKEN_KEY);
  }

  savePending(pending: PendingAuthorization): void {
    this.write(PENDING_KEY, JSON.stringify(pending));
  }

  /** Reads and deletes, since a pending sign-in is single-use. */
  takePending(): PendingAuthorization | null {
    const raw = this.read(PENDING_KEY);
    this.remove(PENDING_KEY);
    return raw ? (JSON.parse(raw) as PendingAuthorization) : null;
  }

  clear(): void {
    this.remove(REFRESH_TOKEN_KEY);
    this.remove(PENDING_KEY);
  }

  // sessionStorage can throw (private mode, disabled storage), so treat that as empty.
  private read(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private write(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // Not stored: a reload will ask to sign in again.
    }
  }

  private remove(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Nothing to remove.
    }
  }
}
