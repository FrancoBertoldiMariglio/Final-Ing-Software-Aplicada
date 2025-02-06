import { Component, OnInit } from '@angular/core';
import { LibroService } from 'src/app/services/libro.service';

@Component({
  selector: 'app-libros',
  templateUrl: './libros.page.html',
  styleUrls: ['./libros.page.scss'],
  standalone: false
})
export class LibrosPage implements OnInit {
  libros: any[] = [];

  constructor(private libroService: LibroService) {}

  ngOnInit() {
    this.libroService.getLibros().subscribe((data: any) => {
      this.libros = data;
    });
  }

  adquirir(libroId: number) {
    this.libroService.adquirirLibro(libroId).subscribe(() => {
      alert('Libro adquirido!');
    });
  }
}
