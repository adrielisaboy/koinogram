import type { AuthService } from './contracts';
import type { User } from '../types/domain';

export class MockAuthService implements AuthService {
  private session: { user: User; issuedAt: string; mode: 'mock' } | null = null;
  constructor(private readonly demoUser: User) {}
  async getSession() { return this.session; }
  async signIn(email: string, password: string) {
    if (!email.includes('@') || password.length < 1) throw new Error('Enter a valid email and password.');
    this.session = { user: this.demoUser, issuedAt: new Date().toISOString(), mode: 'mock' };
    return this.session;
  }
  async signUp(name: string, email: string, password: string) {
    if (name.trim().length < 2 || !email.includes('@') || password.length < 8) throw new Error('Check your name, email, and password, then try again.');
    this.session = { user: { ...this.demoUser, displayName: name.trim(), handle: email.split('@')[0] || 'newfriend' }, issuedAt: new Date().toISOString(), mode: 'mock' };
    return this.session;
  }
  async requestPasswordReset(email: string) { if (!email.includes('@')) throw new Error('Enter a valid email address.'); }
  async signOut() { this.session = null; }
}
