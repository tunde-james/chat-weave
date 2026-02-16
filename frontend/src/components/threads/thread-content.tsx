import { useAuth } from '@clerk/nextjs';

import { ThreadDetail } from '@/types/threads.types';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ThumbsUp } from 'lucide-react';

interface ThreadContentProps {
  thread: ThreadDetail;
  isLiked: boolean;
  likeCount: number;
  onToggleLike: () => void;
  isTogglingLike: boolean;
}

const ThreadContent = ({
  thread,
  isLiked,
  likeCount,
  onToggleLike,
  isTogglingLike,
}: ThreadContentProps) => {
  const { userId } = useAuth();

  return (
    <Card className="border-border/70 bg-card">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge
                variant="outline"
                className="border-border/70 bg-secondary/70 text-[12px]"
              >
                {thread?.category.name}
              </Badge>

              {thread?.author.handle ? (
                <span className="font-bold text-muted-foreground">
                  By @{thread?.author.handle}
                </span>
              ) : null}

              <span className="text-muted-foreground">
                {new Date(thread.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {thread?.title}
            </h1>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2 md:flex-col md:items-stretch">
            {userId ? (
              <Button
                size="sm"
                variant={isLiked ? 'default' : 'outline'}
                disabled={isTogglingLike}
                onClick={onToggleLike}
                className={
                  isLiked
                    ? 'bg-primary text-primary-foreground hover:bg-primary/95'
                    : 'border-border/70 bg-card hover:bg-accent/60'
                }
              >
                <ThumbsUp className="mr-2 h-4 w-4 " />
                {isTogglingLike
                  ? '...'
                  : likeCount > 0
                    ? `${likeCount}`
                    : 'Like'}
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {thread.body}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThreadContent;
