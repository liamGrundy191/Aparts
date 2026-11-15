import type { CreateLeaseInput, Lease, MyLease } from '@aparts/shared';
import { api } from './client';

export const createLease = async ({ unitId, ...values }: CreateLeaseInput & { unitId: string }) => {
  const res = await api.post<Lease>(`/units/${unitId}/leases`, values);
  return res.data;
};

export const getMyLeases = async () => {
  const res = await api.get<MyLease[]>('/me/leases');
  return res.data;
};

export const getMyLease = async (id: string) => {
  const res = await api.get<MyLease>(`/me/leases/${id}`);
  return res.data;
};
