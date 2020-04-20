export interface Grc {
  id: number;
  name: string;
}

export interface AccessionHolder {
  id: number;
  name: string;
  email: string;
  grc: Grc;
}

export const ALL_PERMISSIONS = ['ORDER_MANAGEMENT', 'USER_MANAGEMENT'] as const;
export type Permission = typeof ALL_PERMISSIONS[number];

export interface User {
  id: number;
  name: string;
  permissions: Array<Permission>;
  accessionHolder: AccessionHolder | null;
}

export interface UserCommand {
  name: string;
  permissions: Array<Permission>;
  accessionHolderId: number | null;
}
