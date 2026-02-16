import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ThreadSummary } from '@/types/threads.types';

const ThreadCard = ({ thread }: { thread: ThreadSummary }) => {
  return (
    <Card
      key={thread.id}
      className="group cursor-pointer border-border/70 bg-card transition-colors duration-150 hover:border-primary/70 hover:bg-card/90"
    >
      <Link href={`/threads/${thread.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2 ">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge
                  variant="outline"
                  className="border-border/70 bg-secondary/70 text-[12px]"
                >
                  {thread.category.name}
                </Badge>

                {thread?.author?.handle ? (
                  <span className="text-muted-foreground/90">
                    by @{thread?.author.handle}
                  </span>
                ) : null}

                <span className="text-muted-foreground/85">
                  {new Date(thread.createdAt).toLocaleDateString()}
                </span>
              </div>

              <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary">
                {thread.title}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pb-4 ">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {thread.excerpt}
          </p>
        </CardContent>
      </Link>
    </Card>
  );
};

export default ThreadCard;
