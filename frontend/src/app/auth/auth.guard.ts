import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    try {
      const isAuth = await this.authService.isLoggedIn();

      if (!isAuth) {
        const redirectUrl = state.url;
        await this.router.navigate(['/login'], {
          queryParams: { returnUrl: redirectUrl }
        });
        return false;
      }

      const token = await this.authService.getToken();
      if (!token) {
        await this.authService.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error en AuthGuard:', error);
      await this.authService.logout();
      return false;
    }
  }
}
