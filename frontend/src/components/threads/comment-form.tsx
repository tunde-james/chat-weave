'use client';

import { useAuth } from '@clerk/nextjs';

import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useState } from 'react';

interface CommentFormProps {
  onAddComment: (comment: string) => Promise<void>;
  isPosting: boolean;
}

const CommentForm = ({ onAddComment, isPosting }: CommentFormProps) => {
  const { userId } = useAuth();
  const [newComment, setNewComment] = useState('');

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    await onAddComment(newComment.trim());
    setNewComment('');
  };

  return (
    <div className="space-y-3 border-t border-border pt-6">
      <label htmlFor="" className="block text-sm font-semibold text-foreground">
        Add your reply
      </label>

      <Textarea
        value={newComment}
        onChange={(event) => setNewComment(event.target.value)}
        rows={5}
        placeholder="Enter your comment..."
        disabled={!userId || isPosting}
        className="border-border bg-background/70 text-sm"
      />

      <Button
        onClick={handleSubmit}
        disabled={isPosting || !newComment.trim() || !userId}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isPosting ? 'Posting...' : 'Post Comment'}
      </Button>
    </div>
  );
};

export default CommentForm;
