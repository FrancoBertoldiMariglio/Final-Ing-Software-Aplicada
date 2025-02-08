import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";
import { environment } from 'src/environments/environment';

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

  constructor(private http: HttpClient) {}

  getLibros() {
    return this.http.get(this.apiUrl);
  }

  adquirirLibro(isbn: number) {
    return this.http.post(`${this.apiUrl}/isbn/${isbn}`, {});
  }

  getLibrosByUser(userId: number): Observable<Libro[]> {
    return this.http.get<Libro[]>(`${this.apiUrl}/usuario/${userId}`);
  }
}
