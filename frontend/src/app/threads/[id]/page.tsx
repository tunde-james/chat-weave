'use client';

import { useAuth } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useThread, useToggleLike } from '@/hooks/use-threads';
import ThreadContent from '@/components/threads/thread-content';
import CommentSection from '@/components/threads/comment-section';

const ThreadDetailsPage = () => {
  const params = useParams<{ id: string }>();
  const idStr = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(idStr);

  const router = useRouter();
  const { userId } = useAuth();

  const { data: thread, isLoading: loadingThread } = useThread(id);
  const toggleLikeMutation = useToggleLike(id);

  const handleToggleLike = async () => {
    if (!thread) return;

    if (!userId) {
      toast.error('Sign in is needed', {
        description: 'Please sign in to add a comment',
      });

      return;
    }

    try {
      const isCurrentlyLiked = thread.viewerHasLikedThisPostOrNot;
      await toggleLikeMutation.mutateAsync({ isLiked: isCurrentlyLiked });

      toast.success(isCurrentlyLiked ? 'Like removed' : 'Like added');
    } catch (error) {
      toast.error('Failed to toggle like');
    }
  };

  if (loadingThread) {
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

      <ThreadContent
        thread={thread}
        isLiked={thread.viewerHasLikedThisPostOrNot}
        likeCount={thread.likeCount}
        onToggleLike={handleToggleLike}
        isTogglingLike={toggleLikeMutation.isPending}
      />

      <CommentSection threadId={id} />
    </div>
  );
};

export default ThreadDetailsPage;
