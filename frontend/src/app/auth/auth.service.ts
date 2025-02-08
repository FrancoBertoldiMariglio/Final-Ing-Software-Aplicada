import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

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
  return this.http.post(this.apiUrl, credentials).toPromise()
    .then(async (res: any) => {
      if (res && res.id_token) {
        await this._storage?.set('token', res.id_token);
        this.authState.next(true);
        console.log('Token guardado:', res.id_token);
        return res;
      }
      throw new Error('Token no recibido');
    });
  }

  async logout() {
    try {
      await this._storage?.remove('token');

      const tokenCheck = await this._storage?.get('token');
      if (tokenCheck) {
        console.error('Error: Token no se eliminó correctamente');
        await this._storage?.clear();
      }

      this.authState.next(false);

      await this._storage?.clear();

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
}
