import { IUser } from 'app/entities/user/user.model';

export interface ILibro {
  id: number;
  isbn?: number | null;
  precio?: number | null;
  nombreAutor?: string | null;
  users?: Pick<IUser, 'id'>[] | null;
}

export type NewLibro = Omit<ILibro, 'id'> & { id: null };
