'use client';

import { useAuth } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { Comment, MeResponse, ThreadDetail } from '@/types/threads.types';
import { apiGet, createApiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle, ThumbsUp, Trash2Icon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const ThreadDetailsPage = () => {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const router = useRouter();
  const { getToken, userId } = useAuth();

  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [myHandle, setMyHandle] = useState<string | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [commentBeingDeletedId, setCommentBeingDeletedId] = useState<
    number | null
  >(null);

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isTogglingLike, setIsTogglingLike] = useState(false);

  const apiClient = useMemo(() => createApiClient(getToken), [getToken]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);

      try {
        const [extractThreadDetails, extractCommentsList] = await Promise.all([
          apiGet<ThreadDetail>(apiClient, `/api/v1/threads/${id}`),
          apiGet<Comment[]>(apiClient, `/api/v1/threads/${id}/replies`),
        ]);

        if (!isMounted) return;

        console.log('extractThreadDetails', extractThreadDetails);

        setThread(extractThreadDetails);
        setLikeCount(extractThreadDetails?.likeCount);
        setIsLiked(extractThreadDetails?.viewerHasLikedThisPostOrNot);
        setComments(extractCommentsList);

        if (userId) {
          try {
            const me = await apiGet<MeResponse>(apiClient, '/api/v1/users/me');

            if (!isMounted) return;

            setMyHandle(me?.handle ?? null);
          } catch (error) {
            if (!isMounted) return;
            setMyHandle(null);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (Number.isFinite(id)) {
      load();
    }

    return () => {
      isMounted = false;
    };
  }, [apiClient, id, userId]);

  const handleToggleLike = async () => {
    if (!thread) return;

    if (!userId) {
      toast.error('Sign in is needed', {
        description: 'Please sign in to add a comment',
      });

      return;
    }

    try {
      setIsTogglingLike(true);

      if (isLiked) {
        await apiClient.delete(`/api/v1/threads/${thread.id}/like`);

        setIsLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));

        toast.success('Like removed', {
          description: 'Your upvote has been removed',
        });
      } else {
        await apiClient.post(`/api/v1/threads/${thread.id}/like`);

        setIsLiked(true);
        setLikeCount((prev) => prev + 1);

        toast.success('Like added', {
          description: 'Your upvote has been added',
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsTogglingLike(false);
    }
  };

  const handleAddComment = async () => {
    const trimmedComment = newComment.trim();

    if (trimmedComment.length < 2) return;

    if (!userId) {
      toast.error('Sign in is needed', {
        description: 'Please sign in to add a comment',
      });

      return;
    }

    try {
      setIsPostingComment(true);

      const res = await apiClient.post(`/api/v1/threads/${id}/replies`, {
        body: trimmedComment,
      });

      const newlyCreatedComment: Comment = res.data.data;
      console.log(newlyCreatedComment);

      setComments((prev) => [...prev, newlyCreatedComment]);
      setNewComment('');

      toast.success('Comment added!', {
        description: 'Your reply has been posted',
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentIdToBeDeleted: number) => {
    // Try to use alert component from shadcn instead
    const confirmDelete = window.confirm(
      "Delete this comment? This can't be undone",
    );

    if (!confirmDelete) return;

    if (!userId) {
      toast.error('', {
        description: '',
      });

      return;
    }

    try {
      setCommentBeingDeletedId(id);

      await apiClient.delete(`/api/v1/threads/replies/${commentIdToBeDeleted}`);

      setComments((prev) =>
        prev.filter((cmt) => cmt.id !== commentIdToBeDeleted),
      );

      toast.success('comment deleted', {
        description: 'THIs comment has been deleted',
      });
    } catch (error) {
      console.log(error);
    } finally {
      setCommentBeingDeletedId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-10">
        <p className="text-sm text-muted-foreground">Loading thread...</p>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-10">
        <p className="text-sm text-muted-foreground">
          Thread not found or has been removed!
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.push('/')}
        className="w-fit rounded-full border border-border/70 bg-card/70 px-3 text-xs font-medium text-muted-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to threads
      </Button>

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
                  onClick={handleToggleLike}
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

      <Card className="border-border/70 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="w-5 h-5 text-primary" />
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {comments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No comment(s) yet.
            </p>
          ) : (
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
                          {new Date(comment.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )}
                        </span>
                      </div>

                      {isCommentAuthor ? (
                        <Button
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={commentBeingDeletedId === comment.id}
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
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
          )}

          {/* comment form */}
          <div className="space-y-3 border-t border-border pt-6">
            <label
              htmlFor=""
              className="block text-sm font-semibold text-foreground"
            >
              Add your reply
            </label>

            <Textarea
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              rows={5}
              placeholder="Enter your comment..."
              disabled={!userId || isPostingComment}
              className="border-border bg-background/70 text-sm"
            />

            <Button
              onClick={handleAddComment}
              disabled={isPostingComment || !newComment.trim() || !userId}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPostingComment ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThreadDetailsPage;
