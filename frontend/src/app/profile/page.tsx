'use client';

import { SignedIn, SignedOut, useAuth } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { apiGet, apiPatch, createApiClient } from '@/lib/api-client';
import {
  ProfileFormValues,
  ProfileSchema,
  UserResponse,
} from './profile.schema';
import { AlertCircle, Loader2, Save, User } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useProfile, useUpdateProfile } from '@/hooks/use-profile';

const ProfilePage = () => {
  const { data: profile, isLoading, error } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    values: profile
      ? {
          displayName: profile.displayName ?? '',
          handle: profile.handle ?? '',
          bio: profile.bio ?? '',
          avatarUrl: profile.avatarUrl ?? '',
        }
      : undefined,
  });

  async function onSubmit(values: ProfileFormValues) {
    const payload: Record<string, string> = {};

    if (values.displayName) payload.displayName = values.displayName;
    if (values.handle) payload.handle = values.handle.toLowerCase();
    if (values.bio) payload.bio = values.bio;
    if (values.avatarUrl) payload.avatarUrl = values.avatarUrl;

    try {
      const result = await updateProfileMutation.mutateAsync(payload);

      form.reset({
        displayName: result.displayName ?? '',
        handle: result.handle ?? '',
        bio: result.bio ?? '',
        avatarUrl: result.avatarUrl ?? '',
      });

      toast.success('Profile updated successfully', {
        description: 'Your changes have been saved successfully!',
      });
    } catch (err) {
      toast.error('Failed to update profile', {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  }

  const displayNameValue = form.watch('displayName');
  const handleValue = form.watch('handle');
  const avatarUrlValue = form.watch('avatarUrl');

  return (
    <div>
      <SignedOut>User is signed out</SignedOut>
      <SignedIn>
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
          <div className="flex flex-col items-start">
            <h1 className="flex items-center text-3xl font-bold tracking-tight text-foreground">
              <User className="w-8 h-8 text-primary mr-1.5" />
              Profile Settings
            </h1>
            <p className="mt-1 text-sm text-muted-secondary">
              Manage your profile information
            </p>
          </div>

          {error ? (
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="flex items-center gap-3 py-6">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">
                  {error.message || 'Failed to load profile. Please try again.'}
                </p>
              </CardContent>
            </Card>
          ) : null}

          {isLoading && (
            <Card className="border-border/70 bg-card">
              <CardContent className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading profile...
                </span>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && (
            <>
              <Card className="border-border/70 bg-card">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      {avatarUrlValue ? (
                        <AvatarImage
                          src={avatarUrlValue || 'placeholder'}
                          alt={displayNameValue ?? ''}
                        />
                      ) : null}
                    </Avatar>

                    <div className="flex-1 ">
                      <CardTitle className="text-2xl text-foreground">
                        {displayNameValue || 'Your display name'}
                      </CardTitle>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'rounded-full px-3 py-1 text-xs font-medium',
                            handleValue
                              ? 'bg-primary/10 text-primary'
                              : 'bg-accent text-accent-foreground',
                          )}
                        >
                          {handleValue ? `@${handleValue}` : '@handle'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-border/70 bg-card">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">
                    Edit Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label
                          htmlFor="displayName"
                          className="text-sm font-semibold text-foreground"
                        >
                          Display Name
                        </label>
                        <Input
                          id="displayName"
                          placeholder="Jon Snow"
                          {...form.register('displayName')}
                          disabled={isLoading}
                          className="border-border mt-2 bg-background/60 text-sm"
                        />

                        {form.formState.errors.displayName && (
                          <p className="text-xs text-destructive">
                            {form.formState.errors.displayName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="handle"
                          className="text-sm font-semibold text-foreground"
                        >
                          Handle
                        </label>
                        <Input
                          id="displayName"
                          placeholder="@jon"
                          {...form.register('handle')}
                          disabled={isLoading}
                          className="border-border mt-2 bg-background/60 text-sm"
                        />

                        {form.formState.errors.handle && (
                          <p className="text-xs text-destructive">
                            {form.formState.errors.handle.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="bio"
                          className="text-sm font-semibold text-foreground"
                        >
                          Bio
                        </label>
                        <Textarea
                          id="bio"
                          placeholder="Tell about yourself!!!"
                          rows={4}
                          {...form.register('bio')}
                          disabled={isLoading}
                          className="border-border mt-2 bg-background/60 text-sm"
                        />

                        {form.formState.errors.bio && (
                          <p className="text-xs text-destructive">
                            {form.formState.errors.bio.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="avatarUrl"
                        className="text-sm font-semibold text-foreground"
                      >
                        Avatar URL
                      </label>
                      <Input
                        id="avatarUrl"
                        placeholder="http://abc.com"
                        {...form.register('avatarUrl')}
                        disabled={isLoading}
                        className="border-border mt-2 bg-background/60 text-sm"
                      />

                      {form.formState.errors.avatarUrl && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.avatarUrl.message}
                        </p>
                      )}
                    </div>

                    <CardFooter className="p-0">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="min-w-37.5 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {isLoading ? (
                          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 w-4 h-4" />
                        )}

                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </CardFooter>
                  </form>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </SignedIn>
    </div>
  );
};

export default ProfilePage;
