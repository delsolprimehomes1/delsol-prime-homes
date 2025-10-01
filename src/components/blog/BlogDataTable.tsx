import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3 } from 'lucide-react';

interface TableColumn {
  header: string;
  key: string;
  highlight?: boolean;
}

interface TableRow {
  [key: string]: string | number;
}

interface BlogDataTableProps {
  title: string;
  description?: string;
  columns: TableColumn[];
  rows: TableRow[];
  caption?: string;
  className?: string;
}

export const BlogDataTable: React.FC<BlogDataTableProps> = ({
  title,
  description,
  columns,
  rows,
  caption,
  className = ''
}) => {
  return (
    <Card className={`p-6 bg-muted/20 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          {title}
        </h3>
        <Badge variant="outline" className="ml-auto text-xs">
          Data Comparison
        </Badge>
      </div>
      
      {description && (
        <p className="text-sm text-muted-foreground mb-4">
          {description}
        </p>
      )}
      
      <div className="rounded-lg overflow-hidden border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/5">
              {columns.map((column, index) => (
                <TableHead 
                  key={index}
                  className={column.highlight ? 'font-semibold text-primary' : ''}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-muted/50">
                {columns.map((column, colIndex) => (
                  <TableCell 
                    key={colIndex}
                    className={column.highlight ? 'font-medium' : ''}
                  >
                    {row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {caption && (
        <p className="text-xs text-muted-foreground mt-4 italic">
          {caption}
        </p>
      )}
    </Card>
  );
};

export default BlogDataTable;
