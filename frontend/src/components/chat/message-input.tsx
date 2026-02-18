import { ChangeEvent, KeyboardEvent, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import ImageUploadButton from './image-upload-button';

interface MessageInputProps {
  onSendMessage: (body: string, imageUrl: string | null) => void;
  onTyping: (isTyping: boolean) => void;
  connected: boolean;
  sending: boolean;
}

const MessageInput = ({
  onSendMessage,
  onTyping,
  connected,
  sending,
}: MessageInputProps) => {
  const [input, setInput] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  function handleInputChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const value = event.target.value;
    setInput(value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    onTyping(true);

    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
      typingTimeoutRef.current = null;
    }, 2000);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const body = input.trim();

    if (!body && !imageUrl) return;

    onSendMessage(body, imageUrl);

    // Reset state
    setInput('');
    setImageUrl(null);
    onTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }

  return (
    <div className="space-y-3 border-t border-border bg-card p-5">
      {imageUrl && (
        <div className="rounded-lg border border-border bg-background/70 p-2">
          <p className="mb-2 text-[12px] text-muted-foreground">
            Image ready to send:
          </p>
          <img
            src={imageUrl}
            alt="pending"
            className="max-h-32 rounded-lg border border-border object-contain"
          />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <ImageUploadButton onImageUpload={(url) => setImageUrl(url)} />
          <span className="text-[11px] text-muted-foreground">
            Cloudinary Image Upload
          </span>
        </div>

        <div className="flex gap-2">
          <Textarea
            rows={2}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={!connected || sending}
            className="min-h-4 resize-none border-border bg-background text-sm"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={sending || !connected || (!input.trim() && !imageUrl)}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
