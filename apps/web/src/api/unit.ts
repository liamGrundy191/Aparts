import type { CreateUnitInput, Unit } from '@aparts/shared';
import { api } from './client';
import type { AxiosResponse } from 'axios';

export const createUnit = async (propertyId: string, values: CreateUnitInput) => {
  const createdUnit: AxiosResponse<Unit> = await api.post(
    `/properties/${propertyId}/units`,
    values,
  );
  return createdUnit.data;
};

export const editUnit = async ({ id, ...values }: CreateUnitInput & { id: string }) => {
  const unit: AxiosResponse<Unit> = await api.patch(`/units/${id}`, values);
  return unit.data;
};

export const deleteUnit = async (id: string) => {
  await api.delete(`/units/${id}`);
};
