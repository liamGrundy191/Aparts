import { createProperty, getProperties } from "@/api/property";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";

export function useProperties(page: number) {
    return useQuery({
        queryKey: ['properties', { page }],
        queryFn: () => getProperties(page),
        placeholderData: keepPreviousData,
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
