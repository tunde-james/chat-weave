import { useAuth } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';

import {
  useCreateComment,
  useDeleteComment,
  useThreadReplies,
} from '@/hooks/use-threads';
import { apiGet, createApiClient } from '@/lib/api-client';
import { MeResponse } from '@/types/threads.types';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MessageCircle } from 'lucide-react';
import CommentList from './comment-list';
import CommentForm from './comment-form';
import { useProfile } from '@/hooks/use-profile';

interface CommentSectionProps {
  threadId: number;
}

const CommentSection = ({ threadId }: CommentSectionProps) => {
  const { data: comments = [], isLoading } = useThreadReplies(threadId);
  const { data: profile } = useProfile();
  const addCommentMutation = useCreateComment(threadId);
  const deleteCommentMutation = useDeleteComment(threadId);

  const handleAddComment = async (text: string) => {
    try {
      await addCommentMutation.mutateAsync(text);

      toast.success('Comment added!', {
        description: 'Your reply has been posted',
      });
    } catch (error) {
      toast.error('Failed to post comment');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const confirmDelete = window.confirm(
      "Delete this comment? This can't be undone",
    );
    if (!confirmDelete) return;

    try {
      await deleteCommentMutation.mutateAsync(commentId);

      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <Card className="border-border/70 bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="w-5 h-5 text-primary" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Loading comment(s)...
          </p>
        ) : (
          <CommentList
            comments={comments}
            onDeleteComment={handleDeleteComment}
            commentBeingDeletedId={
              deleteCommentMutation.isPending
                ? (deleteCommentMutation.variables ?? null)
                : null
            }
            myHandle={profile?.handle ?? null}
          />
        )}

        {/* comment form */}
        <CommentForm
          onAddComment={handleAddComment}
          isPosting={addCommentMutation.isPending}
        />
      </CardContent>
    </Card>
  );
};

export default CommentSection;
