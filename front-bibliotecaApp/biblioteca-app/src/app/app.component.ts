import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  public appPages = [
    { title: 'Libros', url: '/libros', icon: 'book' },
    { title: 'Mis Libros', url: '/mis-libros', icon: 'library' }
  ];

  constructor() {}
}
