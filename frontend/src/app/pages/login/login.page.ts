import {Component, OnDestroy, OnInit} from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

interface CustomError {
  message: string;
}

interface PendingCredentials {
  username: string;
  password: string;
  timestamp: number;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit, OnDestroy {
  credentials = { username: '', password: '' };
  isOnline = navigator.onLine;
  private handleOnline: (() => void) | undefined;
  private handleOffline: (() => void) | undefined;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private route: ActivatedRoute,
    private storage: Storage
  ) {}

  ngOnInit() {
    this.isOnline = navigator.onLine;
    if (!this.isOnline) {
      this.handleNetworkChange(false);
    }
    this.setupNetworkListener();
    this.loadSavedCredentials();
  }

  private setupNetworkListener() {
    this.handleOnline = () => this.handleNetworkChange(true);
    this.handleOffline = () => this.handleNetworkChange(false);

    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  async onCredentialsChange() {
    if (!this.isOnline) {
      if (this.credentials.username || this.credentials.password) {
        await this.savePendingCredentials();
      } else {
        // Si se borraron las credenciales, limpiamos el storage
        await this.storage.remove('pendingLogin');
      }
    }
  }

   private async handleNetworkChange(isOnline: boolean) {
    this.isOnline = isOnline;
    if (this.router.url === '/login') {
      if (!isOnline) {
        if (this.credentials.username || this.credentials.password) {
          await this.savePendingCredentials();
          await this.showNetworkToast('Sin conexión a internet');
        } else {
          await this.showNetworkToast('Sin conexión a internet');
        }
      } else {
        await this.checkPendingLogin();
      }
    }
  }

  private async savePendingCredentials() {
    const pendingCredentials: PendingCredentials = {
      username: this.credentials.username,
      password: this.credentials.password,
      timestamp: Date.now()
    };
    await this.storage.set('pendingLogin', pendingCredentials);
  }

  private async loadSavedCredentials() {
    const savedCredentials = await this.storage.get('pendingLogin') as PendingCredentials;
    if (savedCredentials) {
      this.credentials.username = savedCredentials.username;
      this.credentials.password = savedCredentials.password;
    }
  }

  private async checkPendingLogin() {
    if (!this.credentials.username && !this.credentials.password) {
      await this.storage.remove('pendingLogin');
      await this.showNetworkToast('Conexión restaurada');
      return;
    }

    const pendingCredentials = await this.storage.get('pendingLogin') as PendingCredentials;
    if (pendingCredentials) {
      const timePassed = Date.now() - pendingCredentials.timestamp;
      const fiveMinutes = 5 * 60 * 1000;

      if (timePassed < fiveMinutes) {
        await this.storage.remove('pendingLogin');
        await this.showNetworkToast('Conexión restaurada. Puede intentar iniciar sesión.');
      } else {
        await this.storage.remove('pendingLogin');
        await this.showNetworkToast('Las credenciales guardadas han expirado. Por favor, intente nuevamente.');
      }
    } else {
      await this.showNetworkToast('Conexión restaurada');
    }
  }

  async login() {
    if (!this.isOnline) {
      await this.savePendingCredentials();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Iniciando sesión...'
    });
    await loading.present();

    try {
      await this.authService.login(this.credentials);
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/libros';
      await loading.dismiss();
      await this.router.navigate([returnUrl]);
    } catch (err) {
      await loading.dismiss();
      const error = err as CustomError;
      const message = error.message === 'Sin conexión en login'  // Cambiamos la verificación
        ? 'Credenciales guardadas. Se intentará el login cuando vuelva la conexión.'
        : error.message === 'Sin conexión'
          ? 'Sin conexión a internet'
          : 'Error al iniciar sesión. Por favor, verifica tus credenciales.';

      const toast = await this.toastCtrl.create({
        message,
        duration: 3000,
        color: error.message.includes('Sin conexión') ? 'warning' : 'danger'
      });
      toast.present();
      console.error('Error de login', error);
    }
  }

  private async showNetworkToast(message: string) {
    if (this.router.url === '/login') {
      const toast = await this.toastCtrl.create({
        message,
        duration: 3000,
        position: 'top',
        color: this.isOnline ? 'success' : 'warning'
      });
      toast.present();
    }
  }

  ngOnDestroy() {
    if (this.handleOnline) {
      window.removeEventListener('online', this.handleOnline);
    }
    if (this.handleOffline) {
      window.removeEventListener('offline', this.handleOffline);
    }
  }
}
