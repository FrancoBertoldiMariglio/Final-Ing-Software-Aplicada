import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

interface PendingLogin {
  credentials: { username: string; password: string };
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `/api/authenticate`;
  private _storage: Storage | null = null;
  private _initialized = false;
  private authState = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private router: Router
  ) {
    this.init();
  }

  async init() {
    if (this._initialized) return;
    const storage = await this.storage.create();
    this._storage = storage;
    this._initialized = true;

    const token = await this.getToken();
    this.authState.next(!!token);
  }

  login(credentials: { username: string; password: string }) {
    if (!navigator.onLine) {
      return this.handleOfflineLogin(credentials);
    }

    return this.http.post(this.apiUrl, credentials).toPromise()
      .then(async (res: any) => {
        if (res && res.id_token) {
          await this._storage?.set('token', res.id_token);
          this.authState.next(true);
          return res;
        }
        throw new Error('Token no recibido');
      })
      .catch((error: HttpErrorResponse) => {
        if (!navigator.onLine) {
          throw new Error('Se perdió la conexión a internet');
        }
        throw error;
      });
  }

  private async handleOfflineLogin(credentials: { username: string; password: string }) {
    const currentPath = window.location.pathname;
    if (currentPath === '/login') {
      const pendingLogin: PendingLogin = {
        credentials,
        timestamp: Date.now()
      };
      await this._storage?.set('pendingLogin', pendingLogin);
      throw new Error('Sin conexión en login');
    }
    throw new Error('Sin conexión');
  }

  async logout() {
    try {
      await this._storage?.remove('token');
      await this._storage?.remove('pendingLogin');
      this.authState.next(false);
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error durante el logout:', error);
      await this._storage?.clear();
      this.authState.next(false);
      await this.router.navigate(['/login']);
    }
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (e) {
      console.error('Error decodificando token:', e);
      return null;
    }
  }

  async getUserIdFromToken(): Promise<number | null> {
    const token = this._storage?.get('token');
    if (token) {
      const decodedToken = this.decodeToken(await token);
      return decodedToken?.userId || null;
    }
    return null;
  }

  async getToken(): Promise<string | null> {
    await this.init();
    return await this._storage?.get('token') || null;
  }

  async isLoggedIn(): Promise<boolean> {
    await this.init();
    const token = await this.getToken();
    return !!token;
  }

  async checkPendingLogin(): Promise<PendingLogin | null> {
    const pendingLogin = await this._storage?.get('pendingLogin') as PendingLogin;
    if (pendingLogin) {
      const fiveMinutes = 5 * 60 * 1000;
      if (Date.now() - pendingLogin.timestamp < fiveMinutes) {
        return pendingLogin;
      }
      await this._storage?.remove('pendingLogin');
    }
    return null;
  }
}
