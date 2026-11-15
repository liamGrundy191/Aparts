import { createLease, getMyLease, getMyLeases } from '@/api/lease';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/** Manager: add a tenant to a vacant unit of this property. */
export function useCreateLease(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLease,
    onSuccess: () => {
      // the unit is now occupied
      queryClient.invalidateQueries({ queryKey: ['property', { id: propertyId }] });
      toast.success('Tenant added');
    },
  });
}

export function useMyLeases() {
  return useQuery({ queryKey: ['my-leases'], queryFn: getMyLeases });
}

export function useMyLease(id: string) {
  return useQuery({ queryKey: ['my-leases', { id }], queryFn: () => getMyLease(id) });
}
