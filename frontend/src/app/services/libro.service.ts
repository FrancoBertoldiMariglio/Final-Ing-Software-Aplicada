import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { Storage } from '@ionic/storage-angular';

export interface Libro {
  id: number;
  isbn: number;
  precio: number;
  nombreAutor: string;
}

interface LibroPendiente {
  isbn: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class LibroService {
  private apiUrl = `/api/libros`;
  private isOnline = new BehaviorSubject<boolean>(navigator.onLine);

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private storage: Storage
  ) {
    this.isOnline.next(navigator.onLine);

    window.addEventListener('online', () => {
      this.isOnline.next(true);
      this.procesarLibrosPendientes();
    });
    window.addEventListener('offline', () => this.isOnline.next(false));
  }

  getIsOnline() {
    return this.isOnline.asObservable();
  }

  private async guardarLibroPendiente(isbn: number) {
    const librosPendientes: LibroPendiente[] = await this.storage.get('librosPendientes') || [];
    librosPendientes.push({
      isbn,
      timestamp: Date.now()
    });
    await this.storage.set('librosPendientes', librosPendientes);
  }

  private async procesarLibrosPendientes() {
    const librosPendientes: LibroPendiente[] = await this.storage.get('librosPendientes') || [];
    if (librosPendientes.length === 0) return;

    const cincoMinutos = 5 * 60 * 1000;
    const librosValidos = librosPendientes.filter(libro =>
      (Date.now() - libro.timestamp) < cincoMinutos
    );

    for (const libro of librosValidos) {
      try {
        await this.adquirirLibro(libro.isbn, true);
      } catch (error) {
        console.error('Error procesando libro pendiente:', error);
      }
    }

    await this.storage.remove('librosPendientes');
  }

  getLibros() {
    return this.http.get(this.apiUrl);
  }

  async adquirirLibro(isbn: number, esProcesoPendiente: boolean = false) {
    if (!navigator.onLine && !esProcesoPendiente) {
      await this.guardarLibroPendiente(isbn);
      throw new Error('OFFLINE');
    }

    try {
      const userId = await this.authService.getUserIdFromToken();
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const url = `${this.apiUrl}/isbn/${isbn}?userId=${userId}`;
      return await this.http.post(url, {}).toPromise();
    } catch (error) {
      if (!navigator.onLine) {
        throw new Error('OFFLINE');
      }
      throw error;
    }
  }

  getLibrosByUser(userId: number): Observable<Libro[]> {
    return this.http.get<Libro[]>(`${this.apiUrl}/usuario/${userId}`);
  }
}
