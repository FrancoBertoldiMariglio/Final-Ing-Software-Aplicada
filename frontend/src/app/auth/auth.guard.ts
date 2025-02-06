import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    try {
      const isAuth = await this.authService.isLoggedIn();
      if (!isAuth) {
        await this.router.navigate(['/login']);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error en AuthGuard:', error);
      await this.router.navigate(['/login']);
      return false;
    }
  }
}
