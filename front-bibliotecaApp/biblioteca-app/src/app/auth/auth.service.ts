import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/authenticate';
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
    if (this._initialized) {
      return;
    }

    const storage = await this.storage.create();
    this._storage = storage;
    this._initialized = true;

    // Verificar el estado de autenticación al inicio
    const token = await this.getToken();
    this.authState.next(!!token);
  }

  login(credentials: { username: string; password: string }) {
    return this.http.post(this.apiUrl, credentials).toPromise()
      .then(async (res: any) => {
        if (res && res.id_token) {
          await this._storage?.set('token', res.id_token);
          this.authState.next(true);
          return res;
        }
        throw new Error('Token no recibido');
      });
  }

  async logout() {
    await this._storage?.remove('token');
    this.authState.next(false);
    this.router.navigate(['/login']);
  }

  async getToken(): Promise<string | null> {
    await this.init(); // Asegurarse de que storage está inicializado
    return await this._storage?.get('token') || null;
  }

  async isLoggedIn(): Promise<boolean> {
    await this.init(); // Asegurarse de que storage está inicializado
    const token = await this.getToken();
    return !!token;
  }
}
