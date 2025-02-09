import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
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
export class LoginPage {
  credentials = { username: '', password: '' };
  private networkSubscription: Subscription | undefined;  // Inicializamos como undefined
  isOnline = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private route: ActivatedRoute,
    private storage: Storage
  ) {
    this.setupNetworkListener();
    this.loadSavedCredentials();
  }

  private async setupNetworkListener() {
    this.networkSubscription = this.authService.getNetworkStatus().subscribe(
      async isOnline => {
        this.isOnline = isOnline;
        if (!isOnline) {
          await this.showNetworkToast('Sin conexión a internet');
          if (this.credentials.username || this.credentials.password) {
            await this.savePendingCredentials();
          }
        } else {
          await this.showNetworkToast('Conexión restaurada');
          await this.checkPendingLogin();
        }
      }
    );
  }

  private async savePendingCredentials() {
    if (this.credentials.username || this.credentials.password) {
      const pendingCredentials: PendingCredentials = {
        username: this.credentials.username,
        password: this.credentials.password,
        timestamp: Date.now()
      };
      await this.storage.set('pendingLogin', pendingCredentials);
      await this.showNetworkToast('Credenciales guardadas. Se intentará el login cuando vuelva la conexión.');
    }
  }

  private async loadSavedCredentials() {
    const savedCredentials = await this.storage.get('pendingLogin') as PendingCredentials;
    if (savedCredentials) {
      this.credentials.username = savedCredentials.username;
      this.credentials.password = savedCredentials.password;
    }
  }

  private async checkPendingLogin() {
    const pendingCredentials = await this.storage.get('pendingLogin') as PendingCredentials;
    if (pendingCredentials) {
      const timePassed = Date.now() - pendingCredentials.timestamp;
      const fiveMinutes = 5 * 60 * 1000;

      if (timePassed < fiveMinutes) {
        this.credentials = {
          username: pendingCredentials.username,
          password: pendingCredentials.password
        };
        await this.storage.remove('pendingLogin');
        await this.login(true);
      } else {
        await this.storage.remove('pendingLogin');
        await this.showNetworkToast('Las credenciales guardadas han expirado. Por favor, intente nuevamente.');
      }
    }
  }

  async login(isAutoLogin: boolean = false) {
    if (!this.isOnline) {
      await this.savePendingCredentials();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: isAutoLogin ? 'Intentando login pendiente...' : 'Iniciando sesión...'
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
      const message = error.message === 'No hay conexión a internet' || error.message === 'Se perdió la conexión a internet'
        ? error.message
        : 'Error al iniciar sesión. Por favor, verifica tus credenciales.';

      const toast = await this.toastCtrl.create({
        message,
        duration: 3000,
        color: 'danger'
      });
      toast.present();
      console.error('Error de login', error);
    }
  }

  private async showNetworkToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
      color: this.isOnline ? 'success' : 'warning'
    });
    toast.present();
  }

  ngOnDestroy() {
    if (this.networkSubscription) {
      this.networkSubscription.unsubscribe();
    }
  }
}
