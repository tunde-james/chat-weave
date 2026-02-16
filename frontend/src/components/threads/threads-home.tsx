'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '../ui/input';
import { useCategories, useThreads } from '@/hooks/use-threads';
import CategorySidebar from './category-sidebar';
import ErrorDisplay from './error-display';
import ThreadCard from './thread-card';

const ThreadsHomePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get('category') ?? 'all',
  );

  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useCategories();

  const {
    data: threads = [],
    isLoading: isThreadLoading,
    error: threadsError,
    refetch: refetchThreads,
  } = useThreads({ category: activeCategory, search: search });

  const applyFilters = (categoryVal: string, searchVal: string) => {
    const params = new URLSearchParams();

    if (categoryVal && categoryVal !== 'all') {
      params.set('category', categoryVal);
    }

    if (search.trim()) {
      params.set('q', searchVal.trim());
    }

    router.push(`?${params.toString()}`);
    setActiveCategory(categoryVal);

    refetchThreads();
  };

  const handleCategoryChange = (slug: string) => {
    applyFilters(slug, search);
  };

  const isLoading = isCategoriesLoading || isThreadLoading;

  return (
    <div className="flex w-full flex-col gap-6 lg:flex-row">
      <CategorySidebar
        categories={categories}
        activeCategory={activeCategory}
        isLoading={isCategoriesLoading}
        onCategoryChange={handleCategoryChange}
      />

      <div className="flex-1 space-y-6">
        <Card className="border-border/70 bg-card/95">
          <CardHeader className="pb-5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Latest Threads
            </h1>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-10 bg-secondary/80 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                    placeholder="Search Threads..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        applyFilters(activeCategory, search);
                      }
                    }}
                  />
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Search
                </Button>
              </div>
            </div>

            <Link href="/threads/new">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 md:w-auto">
                <Plus className="w-4 h-4" />
                New Thread
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {(categoriesError || threadsError) && (
            <ErrorDisplay
              message={
                categoriesError?.message ||
                threadsError?.message ||
                'Failed to load data. Please try again'
              }
            />
          )}

          {isLoading && !categoriesError && !threadsError ? (
            <div className="flex items-center justify-center rounded-lg border border-border lg-card py-10">
              <p className="text-sm text-muted-foreground">
                Loading threads...
              </p>
            </div>
          ) : null}

          {!isLoading && !threadsError && threads.length === 0 ? (
            <Card className="border-dashed border-border bg-card">
              <CardContent className="py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  No threads found. Create your first thread
                </p>
              </CardContent>
            </Card>
          ) : null}

          {!isLoading &&
            !threadsError &&
            threads.map((thread) => (
              <ThreadCard key={thread.id} thread={thread} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default ThreadsHomePage;
