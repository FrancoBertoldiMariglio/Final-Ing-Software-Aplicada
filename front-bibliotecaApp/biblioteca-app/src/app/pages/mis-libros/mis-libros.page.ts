import { Component, OnInit } from '@angular/core';
import { LibroService, Libro } from '../../services/libro.service'; // Ajusta la ruta según tu estructura



@Component({
  selector: 'app-mis-libros',
  templateUrl: './mis-libros.page.html',
  styleUrls: ['./mis-libros.page.scss'],
  standalone: false
})
export class MisLibrosPage implements OnInit {
  libros: Libro[] = [];

  constructor(private libroService: LibroService) { }

  ngOnInit() {
    const userId = 1; // Por ahora hardcodeamos el userId
    this.libroService.getLibrosByUser(userId).subscribe({
      next: (response: Libro[]) => {
        this.libros = response;
      },
      error: (error) => {
        console.error('Error al cargar los libros:', error);
      }
    });
  }
}
