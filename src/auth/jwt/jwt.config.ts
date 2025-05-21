export enum Role {
  host = 'host',
  member = 'member',
}

export interface JwtPayload {
  role: Role;
  name: string;
}
