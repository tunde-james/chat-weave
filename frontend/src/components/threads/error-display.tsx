import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

const ErrorDisplay = ({ message }: { message: string }) => {
  return (
    <Card className="border-destructive/50 bg-destructive/10">
      <CardContent className="flex items-center gap-3 py-6">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <p className="text-sm text-destructive">{message}</p>
      </CardContent>
    </Card>
  );
};

export default ErrorDisplay;
