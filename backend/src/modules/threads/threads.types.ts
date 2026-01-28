export type Category = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
};

export type CategoryRow = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
};

export function mapCategoryRow(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
  };
}

export type ThreadDetail = {
  id: number;
  title: string;
  body: string;
  category: {
    slug: string;
    name: string;
  };
  author: {
    displayName: string | null;
    handle: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type ThreadDetailRow = {
  id: number;
  title: string;
  body: string;
  category_slug: string;
  category_name: string;
  author_handle: string | null;
  author_display_name: string | null;
  created_at: Date;
  updated_at: Date;
};

export function mapThreadDetailRow(row: ThreadDetailRow): ThreadDetail {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    category: {
      slug: row.category_slug,
      name: row.category_name,
    },
    author: {
      displayName: row.author_display_name,
      handle: row.author_handle,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type ThreadListFilter = {
  page: number;
  pageSize: number;
  categorySlug?: string;
  search?: string;
  sort: 'new' | 'old';
};

export type ThreadSummary = {
  id: number;
  title: string;
  excerpt: string;
  category: {
    slug: string;
    name: string;
  };
  author: {
    displayName: string | null;
    handle: string | null;
  };
  createdAt: Date;
};

export type ThreadSummaryRow = {
  id: number;
  title: string;
  excerpt: string;
  category_slug: string;
  category_name: string;
  author_handle: string | null;
  author_display_name: string | null;
  created_at: Date;
};

export function mapThreadSummaryRow(row: ThreadSummaryRow): ThreadSummary {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    category: {
      slug: row.category_slug,
      name: row.category_name,
    },
    author: {
      displayName: row.author_display_name,
      handle: row.author_handle,
    },
    createdAt: row.created_at,
  };
}
