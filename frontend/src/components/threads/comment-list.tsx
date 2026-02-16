import { Trash2Icon } from 'lucide-react';
import { Button } from '../ui/button';
import { Comment } from '@/types/threads.types';

interface CommentListProps {
  comments: Comment[];
  onDeleteComment: (commentId: number) => void;
  commentBeingDeletedId: number | null;
  myHandle: string | null;
}

const CommentList = ({
  comments,
  onDeleteComment,
  commentBeingDeletedId,
  myHandle,
}: CommentListProps) => {
  if (comments.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No comment(s) yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const isCommentAuthor =
          !!comment.author?.handle &&
          !!myHandle &&
          comment.author?.handle === myHandle;

        return (
          <div
            key={comment.id}
            className="rounded-lg border border-border/80 bg-background/70 p-5"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                {comment.author.handle ? (
                  <span className="text-sm font-medium text-foreground">
                    @{comment.author.handle}
                  </span>
                ) : null}

                <span className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {isCommentAuthor ? (
                <Button
                  onClick={() => onDeleteComment(comment.id)}
                  disabled={commentBeingDeletedId === comment.id}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete comment"
                >
                  <Trash2Icon className="w-5 h-5" />
                </Button>
              ) : null}
            </div>

            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {comment.body}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default CommentList;
