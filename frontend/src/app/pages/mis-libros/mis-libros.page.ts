import { Component, OnInit } from '@angular/core';
import { LibroService, Libro } from '../../services/libro.service';
import { AuthService } from "../../auth/auth.service";
import { Router } from "@angular/router";



@Component({
  selector: 'app-mis-libros',
  templateUrl: './mis-libros.page.html',
  styleUrls: ['./mis-libros.page.scss'],
  standalone: false
})
export class MisLibrosPage implements OnInit {
  libros: Libro[] = [];

  constructor(private libroService: LibroService, private authService: AuthService, private router: Router) { }

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

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
