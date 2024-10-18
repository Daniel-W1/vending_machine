import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AlertBannerProps {
  show: boolean;
  onLogoutAll: () => void;
  onDismiss: () => void;
}

export function AlertBanner({ show, onLogoutAll, onDismiss }: AlertBannerProps) {
  if (!show) return null;

  return (
    <Alert className='absolute z-10 bg-background' variant={'destructive'}>
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription className='flex space-x-2 items-center'>
        <span>You already have active sessions. If that's not you, please logout quickly!</span>
        <Button onClick={onLogoutAll} variant={'ghost'} className='underline'>Logout from all devices</Button>
        <Button onClick={onDismiss} variant={'ghost'} className='text-green-500 px-2'>It's Ok</Button>
      </AlertDescription>
    </Alert>
  );
}