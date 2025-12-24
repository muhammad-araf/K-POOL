import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import UserService from '../services/user.service';
import AuthService from '../services/auth.service';
import { toast } from 'react-toastify';

export const useUser = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const res = await UserService.getProfile();
            return res.data;
        },
        // Only fetch if we have a token (basic check)
        enabled: !!localStorage.getItem('user'),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userData) => UserService.updateProfile(userData),
        onSuccess: (updatedUser) => {
            // Update cache immediately
            queryClient.setQueryData(['user'], updatedUser.data);

            // Sync local storage for persistence across reloads (optional but good for consistency)
            const currentUser = AuthService.getCurrentUser();
            if (currentUser) {
                const merged = { ...currentUser, ...updatedUser.data };
                localStorage.setItem("user", JSON.stringify(merged));
            }

            toast.success("Profile updated successfully!");
        },
        onError: (error) => {
            console.error(error);
            toast.error("Failed to update profile.");
        }
    });
};
