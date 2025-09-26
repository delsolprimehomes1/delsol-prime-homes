import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface TableRow {
  feature: string;
  newBuild: string | boolean;
  resale: string | boolean;
  icon?: 'check' | 'warning' | 'cross' | 'info';
}

interface DataComparisonTableProps {
  title: string;
  subtitle?: string;
  rows: TableRow[];
  className?: string;
}

export const DataComparisonTable: React.FC<DataComparisonTableProps> = ({
  title,
  subtitle,
  rows,
  className = ''
}) => {
  const renderCellValue = (value: string | boolean, icon?: string) => {
    if (typeof value === 'boolean') {
      return (
        <div className="flex items-center gap-2">
          {value ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
          <span className={value ? 'text-green-700 font-medium' : 'text-red-600'}>
            {value ? 'Yes' : 'No'}
          </span>
        </div>
      );
    }

    const getIcon = () => {
      switch (icon) {
        case 'check':
          return <CheckCircle className="w-4 h-4 text-green-600" />;
        case 'warning':
          return <AlertTriangle className="w-4 h-4 text-amber-500" />;
        case 'cross':
          return <XCircle className="w-4 h-4 text-red-500" />;
        case 'info':
          return <Info className="w-4 h-4 text-blue-500" />;
        default:
          return null;
      }
    };

    return (
      <div className="flex items-center gap-2">
        {getIcon()}
        <span className="text-foreground">{value}</span>
      </div>
    );
  };

  const getBadgeVariant = (value: string) => {
    if (value.includes('✅') || value.includes('Yes')) return 'default';
    if (value.includes('⚠️') || value.includes('May')) return 'secondary';
    if (value.includes('❌') || value.includes('No')) return 'destructive';
    return 'outline';
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="p-6 border-b border-border/40">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {title}
        </h3>
        {subtitle && (
          <p className="text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-semibold text-foreground w-1/3">
                🏡 Feature
              </TableHead>
              <TableHead className="font-semibold text-foreground text-center">
                New-Build Homes (2025)
              </TableHead>
              <TableHead className="font-semibold text-foreground text-center">
                Resale Homes (Pre-2020)
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index} className="hover:bg-muted/20 transition-colors">
                <TableCell className="font-medium text-foreground">
                  {row.feature}
                </TableCell>
                <TableCell className="text-center">
                  {renderCellValue(row.newBuild, row.icon)}
                </TableCell>
                <TableCell className="text-center">
                  {renderCellValue(row.resale, row.icon)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary Footer */}
      <div className="p-4 bg-muted/20 border-t border-border/40">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-muted-foreground">Included/Available</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-muted-foreground">May vary/require upgrade</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-muted-foreground">Not available/requires installation</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DataComparisonTable;