import type { FilterParams } from "./common";
import type { BackendQuarterlyControlItemStatus } from "../common/constants";

export interface QuarterlyControlItem {
  id: string;
  quarterlyControlId: string;
  category: string;
  title: string;
  status: BackendQuarterlyControlItemStatus;
  observations: string;
}

export interface QuarterlyControlItemInput {
  category: string;
  title: string;
  status: BackendQuarterlyControlItemStatus;
  observations: string;
}

export interface QuarterlyControlItemFilterParams extends FilterParams {
  quarterlyControlId?: string;
  status?: BackendQuarterlyControlItemStatus;
}
