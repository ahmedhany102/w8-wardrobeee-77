import React from 'react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface StockIndicatorProps {
  stock: number;
  className?: string;
  showNumbers?: boolean;
}

export const StockIndicator: React.FC<StockIndicatorProps> = ({ 
  stock, 
  className = '', 
  showNumbers = false 
}) => {
  const getStockInfo = (stock: number) => {
    if (stock === 0) {
      return {
        variant: 'destructive' as const,
        text: 'نفذت الكمية',
        color: 'text-red-600'
      };
    } else if (stock === 1) {
      return {
        variant: 'destructive' as const,
        text: 'قطعة واحدة فقط!',
        color: 'text-red-600'
      };
    } else if (stock <= 5) {
      return {
        variant: 'outline' as const,
        text: showNumbers ? `بقي ${stock} قطع فقط` : 'كمية محدودة',
        color: 'text-yellow-600 border-yellow-600'
      };
    } else {
      return {
        variant: 'outline' as const,
        text: showNumbers ? `متوفر (${stock} قطعة)` : 'متوفر',
        color: 'text-green-600 border-green-600'
      };
    }
  };

  const stockInfo = getStockInfo(stock);

  return (
    <Badge 
      variant={stockInfo.variant} 
      className={cn(stockInfo.color, className)}
    >
      {stockInfo.text}
    </Badge>
  );
};