import { ImportData } from './importData';

interface OpticalDataTransferProps {
  compact?: boolean;
}

export function OpticalDataTransfer({ compact = false }: OpticalDataTransferProps) {
  return <ImportData compact={compact} transferMode="optical" />;
}
