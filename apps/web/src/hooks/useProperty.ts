import { getProperties } from "@/api/property";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export function useProperties(page: number) {
    return useQuery({
        queryKey: ['properties', { page }],
        queryFn: () => getProperties(page),
        placeholderData: keepPreviousData,
    });
}
