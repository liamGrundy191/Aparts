import type {
  CreatePropertyInput,
  PaginationProperty,
  Property,
  PropertyWithUnits,
} from '@aparts/shared';
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

export const getPropertyById = async (id: string) => {
  const property: AxiosResponse<PropertyWithUnits> = await api.get(`/properties/${id}`);
  return property.data;
};

export const editProperty = async ({ id, ...values }: CreatePropertyInput & { id: string }) => {
  const property: AxiosResponse<PropertyWithUnits> = await api.patch(`/properties/${id}`, values);
  return property.data;
};

export const deleteProperty = async (id: string) => {
  await api.delete(`/properties/${id}`);
};
