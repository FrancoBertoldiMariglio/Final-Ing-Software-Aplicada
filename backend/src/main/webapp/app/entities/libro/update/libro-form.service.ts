import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ILibro, NewLibro } from '../libro.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ILibro for edit and NewLibroFormGroupInput for create.
 */
type LibroFormGroupInput = ILibro | PartialWithRequiredKeyOf<NewLibro>;

type LibroFormDefaults = Pick<NewLibro, 'id' | 'users'>;

type LibroFormGroupContent = {
  id: FormControl<ILibro['id'] | NewLibro['id']>;
  isbn: FormControl<ILibro['isbn']>;
  precio: FormControl<ILibro['precio']>;
  nombreAutor: FormControl<ILibro['nombreAutor']>;
  users: FormControl<ILibro['users']>;
};

export type LibroFormGroup = FormGroup<LibroFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class LibroFormService {
  createLibroFormGroup(libro: LibroFormGroupInput = { id: null }): LibroFormGroup {
    const libroRawValue = {
      ...this.getFormDefaults(),
      ...libro,
    };
    return new FormGroup<LibroFormGroupContent>({
      id: new FormControl(
        { value: libroRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      isbn: new FormControl(libroRawValue.isbn),
      precio: new FormControl(libroRawValue.precio),
      nombreAutor: new FormControl(libroRawValue.nombreAutor),
      users: new FormControl(libroRawValue.users ?? []),
    });
  }

  getLibro(form: LibroFormGroup): ILibro | NewLibro {
    return form.getRawValue() as ILibro | NewLibro;
  }

  resetForm(form: LibroFormGroup, libro: LibroFormGroupInput): void {
    const libroRawValue = { ...this.getFormDefaults(), ...libro };
    form.reset(
      {
        ...libroRawValue,
        id: { value: libroRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): LibroFormDefaults {
    return {
      id: null,
      users: [],
    };
  }
}
