import { IAuthority, NewAuthority } from './authority.model';

export const sampleWithRequiredData: IAuthority = {
  name: 'e5dc35db-831a-449d-9dac-51bc175fa626',
};

export const sampleWithPartialData: IAuthority = {
  name: 'bf1d13af-2567-42e8-815a-6a9bb97d2e3c',
};

export const sampleWithFullData: IAuthority = {
  name: 'fa7ef729-1932-4b3b-91a1-1e824c86c82a',
};

export const sampleWithNewData: NewAuthority = {
  name: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
