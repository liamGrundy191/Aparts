import type { CreatePropertyInput, PaginationProperty, Property } from '@aparts/shared';
import { api } from './client';
import type { AxiosResponse } from 'axios';

export const getProperties = async (page = 1, limit = 20) => {
  const properties: AxiosResponse<PaginationProperty> = await api.get(
    `/properties?page=${page}&limit=${limit}`,
  );
  return properties.data;
};

export const createProperty = async (values: CreatePropertyInput) => {
  const createdProperty: AxiosResponse<Property> = await api.post('/properties', values);
  return createdProperty.data;
};
