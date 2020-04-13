export interface AccessionHolder {
  id: number;
  name: string;
  grcName: string;
}

export type Permission = 'ORDER_MANAGEMENT' | 'USER_MANAGEMENT';

export interface User {
  id: number;
  name: string;
  permissions: Array<Permission>;
  accessionHolder: AccessionHolder | null;
}
