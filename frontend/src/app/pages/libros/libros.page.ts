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

  constructor(private libroService: LibroService, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.libroService.getLibros().subscribe((data: any) => {
      this.libros = data;
    });
  }

  adquirir(isbn: number) {
    this.libroService.adquirirLibro(isbn).subscribe(() => {
      alert('Libro adquirido!');
    });
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
