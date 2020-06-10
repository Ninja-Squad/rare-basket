export interface Grc {
  id: number;
  name: string;
  institution: string;
  address: string;
}

export interface GrcCommand {
  name: string;
  institution: string;
  address: string;
}

export interface AccessionHolder {
  id: number;
  name: string;
  email: string;
  phone: string;
  grc: Grc;
}

export interface AccessionHolderCommand {
  name: string;
  email: string;
  phone: string;
  grcId: number;
}

export const ALL_PERMISSIONS = ['ORDER_MANAGEMENT', 'ORDER_VISUALIZATION', 'ADMINISTRATION'] as const;
export type Permission = typeof ALL_PERMISSIONS[number];

export interface User {
  id: number;
  name: string;
  permissions: Array<Permission>;
  accessionHolder: AccessionHolder | null;
  globalVisualization: boolean;
  visualizationGrcs: Array<Grc>;
}

export interface UserCommand {
  name: string;
  permissions: Array<Permission>;
  accessionHolderId: number | null;
  globalVisualization: boolean;
  visualizationGrcIds: Array<number>;
}
