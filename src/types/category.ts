import type { FilterParams } from "./common";

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface CategoryInput {
  name: string;
  description?: string;
}

export interface CategoryFilterParams extends FilterParams {
  name?: string;
}
