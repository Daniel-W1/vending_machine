import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface BuyerPanelProps {
  balance: number;
  onDeposit: (amount: number) => void;
  onResetBalance: () => void;
  isDepositing: boolean;
  isResetting: boolean;
}

export function BuyerPanel({
  balance,
  onDeposit,
  onResetBalance,
  isDepositing,
  isResetting
}: BuyerPanelProps) {
  return (
    <div className="bg-white rounded-lg p-4 mb-6">
      <div className="flex space-x-3 justify-between items-center mb-3">
        <h2 className="font-bold mb-2">Your Balance: ${balance.toFixed(2)}</h2>
        <Button onClick={onResetBalance} variant="ghost" size={'sm'} disabled={isResetting} className='hover:bg-red-500 hover:text-white'>
          Reset Balance
          {isResetting && <Loader2 className="w-4 h-4 ml-2" />}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[5, 10, 20, 50, 100].map((coin) => (
          <Button
            key={coin}
            onClick={() => onDeposit(coin / 100)}
            disabled={isDepositing}
            className="flex-1"
          >
            {isDepositing ? <Loader2 size="sm" /> : `${coin}¢`}
          </Button>
        ))}
      </div>
    </div>
  );
}