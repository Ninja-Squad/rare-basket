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

type ALL_PERMISSIONS = ['ORDER_MANAGEMENT', 'ORDER_VISUALIZATION', 'ADMINISTRATION'];
export type Permission = ALL_PERMISSIONS[number];

export interface User {
  id: number;
  name: string;
  permissions: Array<Permission>;
  accessionHolders: Array<AccessionHolder>;
  globalVisualization: boolean;
  visualizationGrcs: Array<Grc>;
}

export interface UserCommand {
  name: string;
  permissions: Array<Permission>;
  accessionHolderIds: Array<number>;
  globalVisualization: boolean;
  visualizationGrcIds: Array<number>;
}
