import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {
  credentials = { username: '', password: '' };

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private route: ActivatedRoute
  ) {}

  async login() {
    const loading = await this.loadingCtrl.create({
      message: 'Iniciando sesión...'
    });
    await loading.present();

    try {
      await this.authService.login(this.credentials);
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/libros';
      await loading.dismiss();
      await this.router.navigate([returnUrl]);
    } catch (error) {
      await loading.dismiss();
      const toast = await this.toastCtrl.create({
        message: 'Error al iniciar sesión. Por favor, verifica tus credenciales.',
        duration: 3000,
        color: 'danger'
      });
      toast.present();
      console.error('Error de login', error);
    }
  }
}
