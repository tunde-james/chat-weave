'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { apiGet, createApiClient } from '@/lib/api-client';
import {
  ProfileFormValues,
  ProfileSchema,
  UserResponse,
} from './profile.schema';

const ProfilePage = () => {
  const { getToken } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const apiClient = useMemo(() => createApiClient(getToken), [getToken]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      displayName: '',
      handle: '',
      bio: '',
      avatarUrl: '',
    },
  });

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setIsLoading(true);

        const getUserInfo = await apiGet<UserResponse>(
          apiClient,
          '/api/v1/users/me',
        );

        if (!isMounted) {
          return;
        }

        console.log('getUserInfo:', getUserInfo);

        form.reset({
          displayName: getUserInfo.displayName ?? '',
          handle: getUserInfo.handle ?? '',
          bio: getUserInfo.bio ?? '',
          avatarUrl: getUserInfo.avatarUrl ?? '',
        });
      } catch (error: any) {
        console.log(error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();
  }, [apiClient, form]);

  return <div>Profile</div>;
};

export default ProfilePage;
