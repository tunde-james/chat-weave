'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { Category, ThreadDetail } from '@/app/types/threads';
import { apiGet, createApiClient } from '@/lib/api-client';
import { NewThreadFormValues, newThreadSchema } from '../threads.schema';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const NewThreadsPage = () => {
  const { getToken } = useAuth();
  const router = useRouter();

  const apiClient = useMemo(() => createApiClient(getToken), [getToken]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NewThreadFormValues>({
    resolver: zodResolver(newThreadSchema),
    defaultValues: {
      title: '',
      body: '',
      categorySlug: '',
    },
  });

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);

      try {
        const extractCats = await apiGet<Category[]>(
          apiClient,
          '/api/v1/threads/categories',
        );

        if (!isMounted) return;

        setCategories(extractCats);

        if (extractCats.length > 0) {
          form.setValue('categorySlug', extractCats[0]?.slug);
        }
      } catch (e) {
        console.log(e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
  }, [apiClient, form]);

  const OnThreadSubmit = async (values: NewThreadFormValues) => {
    try {
      setIsSubmitting(true);

      // Add a new method in apiClient file -> apiPost
      const response = await apiClient.post('/api/v1/threads', {
        title: values.title,
        body: values.body,
        categorySlug: values.categorySlug,
      });

      const created = response?.data?.data as ThreadDetail;

      toast.success('New thread created successfully!', {
        description: 'Your thread is noe live!',
      });

      router.push('/');
      // router.push(`/${created?.id}`);
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Start a new thread
        </h1>
      </div>

      <Card className="border-border/70 bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">
            Thread Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(OnThreadSubmit)}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-semibold text-foreground"
              >
                Thread Title
              </label>
              <Input
                id="title"
                placeholder="Thread title..."
                {...form.register('title')}
                disabled={isLoading || isSubmitting}
                className="border-border mt-2 bg-background/70 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="categorySlug"
                className="text-sm font-semibold text-foreground"
              >
                Category
              </label>
              <select
                id="categorySlug"
                {...form.register('categorySlug')}
                disabled={isLoading || isSubmitting}
                className="h-10 mt-3 w-full rounded-md border border-border bg-background/70 px-3 text-sm text-foreground focus:outline focus:ring-2 focus:ring-primary/30"
              >
                {categories.map((category) => (
                  <option
                    value={category.slug}
                    key={category.slug}
                    id={category.slug}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="body"
                className="text-sm font-semibold text-foreground"
              >
                Description
              </label>
              <Textarea
                id="body"
                rows={8}
                placeholder="Thread description..."
                disabled={isLoading || isSubmitting}
                {...form.register('body')}
                className="border-border mt-2 bg-background/70 text-sm"
              />
            </div>

            <CardFooter className="flex justify-end border-t border-border px-0 pt-5">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:primary/90"
              >
                {isSubmitting ? 'Submitting...' : 'Publish Thread'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewThreadsPage;
