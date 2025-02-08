import { Component, OnInit } from '@angular/core';
import { LibroService } from 'src/app/services/libro.service';
import { AuthService } from "../../auth/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-libros',
  templateUrl: './libros.page.html',
  styleUrls: ['./libros.page.scss'],
  standalone: false
})
export class LibrosPage implements OnInit {
  libros: any[] = [];
  librosFiltrados: any[] = [];
  filtroNombre: string = '';
  filtroIsbn: string = '';

  constructor(
    private libroService: LibroService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarLibros();
  }

  cargarLibros() {
    this.libroService.getLibros().subscribe((data: any) => {
      this.libros = data;
      this.aplicarFiltros();
    });
  }

  aplicarFiltros() {
    this.librosFiltrados = this.libros.filter(libro => {
      const cumpleNombre = !this.filtroNombre ||
        libro.nombreAutor.toLowerCase().includes(this.filtroNombre.toLowerCase());

      const cumpleIsbn = !this.filtroIsbn ||
        libro.isbn.toString().includes(this.filtroIsbn);

      return cumpleNombre && cumpleIsbn;
    });
  }

  async adquirir(isbn: number) {
    try {
      await this.libroService.adquirirLibro(isbn);
      alert('Libro adquirido!');
    } catch (error) {
      console.error('Error al adquirir libro:', error);
      alert('Error al adquirir el libro');
    }
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
