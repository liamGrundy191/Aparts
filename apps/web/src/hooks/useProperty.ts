import {
  createProperty,
  deleteProperty,
  editProperty,
  getProperties,
  getPropertyById,
} from '@/api/property';
import { getErrorMessage } from '@/lib/errors';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useProperties(page: number) {
  return useQuery({
    queryKey: ['properties', { page }],
    queryFn: () => getProperties(page),
    placeholderData: keepPreviousData,
  });
}

export function useGetProperty(id: string) {
  return useQuery({
    queryKey: [`property`, { id }],
    queryFn: () => getPropertyById(id),
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useEditProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editProperty,
    onSuccess: (property) => {
      queryClient.invalidateQueries({ queryKey: [`property`, { id: property.id }] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Property Edited');
    },
  });
}

export function useDeleteProperty(id: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: [`property`, { id }] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Property Deleted');
      navigate('/manager');
    },
    onError(error) {
      toast.error(getErrorMessage(error));
    },
  });
}
