import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isLoggedIn']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('debería crearse el guard', () => {
    expect(guard).toBeTruthy();
  });

  it('debería permitir acceso si el usuario está autenticado', async () => {
    authServiceSpy.isLoggedIn.and.returnValue(Promise.resolve(true));

    const result = await guard.canActivate();
    expect(result).toBeTrue();
  });

  it('debería redirigir al login si el usuario no está autenticado', async () => {
    authServiceSpy.isLoggedIn.and.returnValue(Promise.resolve(false));

    const result = await guard.canActivate();
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
