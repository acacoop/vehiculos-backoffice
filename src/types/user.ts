import type { FilterParams } from "./common";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  cuit: string;
  active?: boolean;
}

export interface UserInput {
  firstName: string;
  lastName: string;
  email: string;
  cuit: string;
  password: string;
}

export interface UserFilterParams extends FilterParams {
  email?: string;
  cuit?: string;
  firstName?: string;
  lastName?: string;
  active?: boolean;
}
