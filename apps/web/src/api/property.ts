import type { PaginationProperty } from '@aparts/shared';
import { api } from './client';
import type { AxiosResponse } from 'axios';

export const getProperties = async (page = 1, limit = 20) => {
  const properties: AxiosResponse<PaginationProperty> = await api.get(
    `/properties?page=${page}&limit=${limit}`,
  );
  return properties.data;
};
