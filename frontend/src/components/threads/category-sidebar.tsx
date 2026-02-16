import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { Category } from '@/types/threads.types';

const CategorySidebar = ({
  categories,
  activeCategory,
  isLoading,
  onCategoryChange,
}: {
  categories: Category[];
  activeCategory: string;
  isLoading: boolean;
  onCategoryChange: (slug: string) => void;
}) => {
  return (
    <aside className="w-full shrink-0 lg:w-72">
      <Card className="sticky top-24 border-sidebar-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Categories</CardTitle>
            <Link href="/threads/new">
              <Button
                size="icon"
                className="h-8 w-8 rounded-full bg-primary text-primary-foreground shadow-sm shadow-primary/40"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <button
            onClick={() => onCategoryChange('all')}
            className={`cursor-pointer flex w-full items-center px-3 py-3 text-sm font-medium transition-colors hover:bg-card/80 hover:text-foreground ${
              activeCategory === 'all'
                ? 'text-foreground bg-secondary/50'
                : 'text-muted-foreground'
            }`}
          >
            All categories
          </button>
          {isLoading && (
            <div className="flex items-center justify-center rounded-lg border border-border bg-card py-10">
              <p className="text-sm text-muted-foreground">
                Loading categories...
              </p>
            </div>
          )}
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => onCategoryChange(cat.slug)}
              className={`cursor-pointer flex w-full items-center px-3 py-3 text-sm font-medium transition-colors hover:bg-card/80 hover:text-foreground ${
                activeCategory === cat.slug
                  ? 'text-foreground bg-secondary/50'
                  : 'text-muted-foreground'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </CardContent>
      </Card>
    </aside>
  );
};

export default CategorySidebar;
