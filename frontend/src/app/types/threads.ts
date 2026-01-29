export type Category = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
};

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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
};
