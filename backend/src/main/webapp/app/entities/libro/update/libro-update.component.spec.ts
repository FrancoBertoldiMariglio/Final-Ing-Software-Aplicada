import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { LibroService } from '../service/libro.service';
import { ILibro } from '../libro.model';
import { LibroFormService } from './libro-form.service';

import { LibroUpdateComponent } from './libro-update.component';

describe('Libro Management Update Component', () => {
  let comp: LibroUpdateComponent;
  let fixture: ComponentFixture<LibroUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let libroFormService: LibroFormService;
  let libroService: LibroService;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LibroUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(LibroUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(LibroUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    libroFormService = TestBed.inject(LibroFormService);
    libroService = TestBed.inject(LibroService);
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call User query and add missing value', () => {
      const libro: ILibro = { id: 456 };
      const users: IUser[] = [{ id: 32384 }];
      libro.users = users;

      const userCollection: IUser[] = [{ id: 21987 }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [...users];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ libro });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining),
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const libro: ILibro = { id: 456 };
      const users: IUser = { id: 24670 };
      libro.users = [users];

      activatedRoute.data = of({ libro });
      comp.ngOnInit();

      expect(comp.usersSharedCollection).toContain(users);
      expect(comp.libro).toEqual(libro);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILibro>>();
      const libro = { id: 123 };
      jest.spyOn(libroFormService, 'getLibro').mockReturnValue(libro);
      jest.spyOn(libroService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ libro });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: libro }));
      saveSubject.complete();

      // THEN
      expect(libroFormService.getLibro).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(libroService.update).toHaveBeenCalledWith(expect.objectContaining(libro));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILibro>>();
      const libro = { id: 123 };
      jest.spyOn(libroFormService, 'getLibro').mockReturnValue({ id: null });
      jest.spyOn(libroService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ libro: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: libro }));
      saveSubject.complete();

      // THEN
      expect(libroFormService.getLibro).toHaveBeenCalled();
      expect(libroService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILibro>>();
      const libro = { id: 123 };
      jest.spyOn(libroService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ libro });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(libroService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareUser', () => {
      it('Should forward to userService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(userService, 'compareUser');
        comp.compareUser(entity, entity2);
        expect(userService.compareUser).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
