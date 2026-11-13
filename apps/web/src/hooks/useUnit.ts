import { createUnit, deleteUnit, editUnit } from '@/api/unit';
import { getErrorMessage } from '@/lib/errors';
import type { CreateUnitInput } from '@aparts/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useCreateUnit(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateUnitInput) => createUnit(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`property`, { id }] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Unit Created');
    },
  });
}

export function useEditUnit(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`property`, { id }] });
      toast.success('Unit Edited');
    },
  });
}

export function useDeleteUnit(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`property`, { id }] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Unit Deleted');
    },
    onError(error) {
      toast.error(getErrorMessage(error));
    },
  });
}
