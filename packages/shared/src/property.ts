export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  notes?: string;
}

interface meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface propertyAndUnitCount extends Property {
  _count: {
    units: number;
  };
}

export interface PaginationProperty {
  data: propertyAndUnitCount[];
  meta: meta;
}
