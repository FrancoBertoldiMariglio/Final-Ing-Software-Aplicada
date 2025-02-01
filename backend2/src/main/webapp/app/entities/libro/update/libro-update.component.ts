import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { ILibro } from '../libro.model';
import { LibroService } from '../service/libro.service';
import { LibroFormGroup, LibroFormService } from './libro-form.service';

@Component({
  standalone: true,
  selector: 'jhi-libro-update',
  templateUrl: './libro-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class LibroUpdateComponent implements OnInit {
  isSaving = false;
  libro: ILibro | null = null;

  usersSharedCollection: IUser[] = [];

  protected libroService = inject(LibroService);
  protected libroFormService = inject(LibroFormService);
  protected userService = inject(UserService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: LibroFormGroup = this.libroFormService.createLibroFormGroup();

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ libro }) => {
      this.libro = libro;
      if (libro) {
        this.updateForm(libro);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const libro = this.libroFormService.getLibro(this.editForm);
    if (libro.id !== null) {
      this.subscribeToSaveResponse(this.libroService.update(libro));
    } else {
      this.subscribeToSaveResponse(this.libroService.create(libro));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ILibro>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(libro: ILibro): void {
    this.libro = libro;
    this.libroFormService.resetForm(this.editForm, libro);

    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(this.usersSharedCollection, ...(libro.users ?? []));
  }

  protected loadRelationshipsOptions(): void {
    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, ...(this.libro?.users ?? []))))
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));
  }
}
