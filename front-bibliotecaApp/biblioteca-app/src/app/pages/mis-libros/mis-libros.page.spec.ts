import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisLibrosPage } from './mis-libros.page';

describe('MisLibrosPage', () => {
  let component: MisLibrosPage;
  let fixture: ComponentFixture<MisLibrosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisLibrosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
