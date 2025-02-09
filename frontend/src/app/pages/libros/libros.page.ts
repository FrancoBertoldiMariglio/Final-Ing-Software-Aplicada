import { Component, OnInit, OnDestroy } from '@angular/core';
import { LibroService } from 'src/app/services/libro.service';
import { AuthService } from "../../auth/auth.service";
import { Router } from "@angular/router";
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-libros',
  templateUrl: './libros.page.html',
  styleUrls: ['./libros.page.scss'],
  standalone: false
})
export class LibrosPage implements OnInit, OnDestroy {
  libros: any[] = [];
  librosFiltrados: any[] = [];
  filtroNombre: string = '';
  filtroIsbn: string = '';
  isOnline = navigator.onLine;
  private onlineSubscription?: Subscription;

  constructor(
    private libroService: LibroService,
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.isOnline = navigator.onLine;
    this.cargarLibros();
    this.onlineSubscription = this.libroService.getIsOnline().subscribe(
      online => {
        if (this.isOnline !== online) {
          this.isOnline = online;
          this.mostrarMensajeConexion(online);
        }
      }
    );
  }

  private async mostrarMensajeConexion(online: boolean) {
    if (this.router.url === '/libros') {
      const toast = await this.toastCtrl.create({
        message: online ? 'Conexión restaurada' : 'Sin conexión',
        duration: 2000,
        position: 'top',
        color: online ? 'success' : 'warning'
      });
      toast.present();
    }
  }

  cargarLibros() {
    this.libroService.getLibros().subscribe(
      (data: any) => {
        this.libros = data;
        this.aplicarFiltros();
      },
      error => {
        console.error('Error cargando libros:', error);
      }
    );
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
      const toast = await this.toastCtrl.create({
        message: 'Libro adquirido con éxito',
        duration: 2000,
        color: 'success'
      });
      toast.present();
    } catch (error: any) {
      const toast = await this.toastCtrl.create({
        message: error.message === 'OFFLINE'
          ? 'Libro guardado para adquirir cuando se restaure la conexión'
          : 'Error al adquirir el libro',
        duration: 3000,
        color: error.message === 'OFFLINE' ? 'warning' : 'danger'
      });
      toast.present();
    }
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    if (this.onlineSubscription) {
      this.onlineSubscription.unsubscribe();
    }
  }
}
