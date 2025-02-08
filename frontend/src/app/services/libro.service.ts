import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from "rxjs";
import { AuthService } from "../auth/auth.service";

export interface Libro {
  id: number;
  isbn: number;
  precio: number;
  nombreAutor: string;
}

@Injectable({
  providedIn: 'root'
})
export class LibroService {
  private apiUrl = `/api/libros`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getLibros() {
    return this.http.get(this.apiUrl);
  }

  async adquirirLibro(isbn: number) {
    try {
      const userId = await this.authService.getUserIdFromToken();
      console.log('LibroService - userId:', userId);

      if (!userId) {
        console.error('No se pudo obtener el userId del token');
        throw new Error('Usuario no autenticado');
      }

      const url = `${this.apiUrl}/isbn/${isbn}?userId=${userId}`;
      console.log('LibroService - Adquiriendo libro from:', url);
      return this.http.post(url, {}).toPromise();
    } catch (error) {
      console.error('Error al adquirir libro:', error);
      throw error;
    }
  }

  getLibrosByUser(userId: number): Observable<Libro[]> {
    return this.http.get<Libro[]>(`${this.apiUrl}/usuario/${userId}`);
  }
}
