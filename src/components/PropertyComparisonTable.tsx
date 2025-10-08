import React from 'react';
import { TrendingUp } from 'lucide-react';

interface PropertyComparisonData {
  location: string;
  pricePerM2: number;
  avgPropertyPrice: number;
  rentalYield: number;
  popularityScore: number;
}

interface PropertyComparisonTableProps {
  data: PropertyComparisonData[];
  title?: string;
  sourceText?: string;
  lastUpdated?: string;
}

export const PropertyComparisonTable: React.FC<PropertyComparisonTableProps> = ({ 
  data,
  title = "Costa del Sol Property Market Overview",
  sourceText = "Idealista.com market data, Q4 2025. Updated monthly.",
  lastUpdated = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}) => {
  return (
    <div className="my-8" data-speakable="true">
      <div className="mb-4">
        <h3 className="text-2xl font-semibold text-foreground mb-2 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
      </div>
      
      <div className="overflow-x-auto rounded-lg border border-border shadow-sm">
        <table className="w-full border-collapse bg-card">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="p-4 text-left font-semibold">Location</th>
              <th className="p-4 text-right font-semibold">Price/m²</th>
              <th className="p-4 text-right font-semibold">Avg Property</th>
              <th className="p-4 text-right font-semibold">Rental Yield</th>
              <th className="p-4 text-right font-semibold">Popularity</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr 
                key={idx} 
                className="border-b border-border hover:bg-accent/50 transition-colors"
              >
                <td className="p-4 font-semibold text-foreground">{row.location}</td>
                <td className="p-4 text-right text-foreground">€{row.pricePerM2.toLocaleString()}</td>
                <td className="p-4 text-right text-foreground">€{row.avgPropertyPrice.toLocaleString()}</td>
                <td className="p-4 text-right">
                  <span className={`font-medium ${
                    row.rentalYield >= 5 ? 'text-green-600' : 
                    row.rentalYield >= 4 ? 'text-amber-600' : 
                    'text-muted-foreground'
                  }`}>
                    {row.rentalYield}%
                  </span>
                </td>
                <td className="p-4 text-right">
                  <span className="inline-flex items-center gap-1 font-medium text-foreground">
                    {row.popularityScore}/10
                    <span className="text-amber-500">★</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <p className="text-xs text-muted-foreground mt-3 italic">
        Source: {sourceText}
      </p>
    </div>
  );
};

// Default Costa del Sol market data
export const costaDelSolMarketData: PropertyComparisonData[] = [
  { 
    location: 'Marbella - Golden Mile', 
    pricePerM2: 6800, 
    avgPropertyPrice: 890000, 
    rentalYield: 3.2, 
    popularityScore: 9.5 
  },
  { 
    location: 'Estepona - New Port', 
    pricePerM2: 4200, 
    avgPropertyPrice: 520000, 
    rentalYield: 4.8, 
    popularityScore: 8.7 
  },
  { 
    location: 'Fuengirola - Beach Front', 
    pricePerM2: 3900, 
    avgPropertyPrice: 380000, 
    rentalYield: 5.2, 
    popularityScore: 7.9 
  },
  { 
    location: 'Benalmádena - Costa', 
    pricePerM2: 3500, 
    avgPropertyPrice: 340000, 
    rentalYield: 5.5, 
    popularityScore: 7.5 
  },
  { 
    location: 'Málaga - City Centre', 
    pricePerM2: 4500, 
    avgPropertyPrice: 425000, 
    rentalYield: 4.5, 
    popularityScore: 8.9 
  }
];
