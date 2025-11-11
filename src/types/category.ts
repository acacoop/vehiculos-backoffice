import type { FilterParams } from "./common";

export interface Category {
  id: string;
  name: string;
}

export interface CategoryInput {
  name: string;
}

export interface CategoryFilterParams extends FilterParams {
  name?: string;
}
