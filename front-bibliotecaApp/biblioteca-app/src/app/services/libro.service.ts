import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";

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
  private apiUrl = 'https:///api/libros';

  constructor(private http: HttpClient) {}

  getLibros() {
    return this.http.get(this.apiUrl);
  }

  adquirirLibro(libroId: number) {
    return this.http.post(`${this.apiUrl}/${libroId}/adquirir`, {});
  }

  getLibrosByUser(userId: number): Observable<Libro[]> {
  return this.http.get<Libro[]>(`${this.apiUrl}/usuario/${userId}`);
}
}
