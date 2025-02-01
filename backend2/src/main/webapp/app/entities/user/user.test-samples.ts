import { IUser } from './user.model';

export const sampleWithRequiredData: IUser = {
  id: 11388,
  login: 'jUZ!@-\\jA9jo6s\\zQ8oG1i\\TlNeK\\}ABE729',
};

export const sampleWithPartialData: IUser = {
  id: 21698,
  login: "vHp5@VL7XN\\RoM\\}BO4-T\\rYTF\\'Sy\\63",
};

export const sampleWithFullData: IUser = {
  id: 27280,
  login: 'wQh@',
};
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
