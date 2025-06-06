
import { NewsCategory } from '@/types/news';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Rss, 
  Play, 
  Gamepad2, 
  Newspaper,
  Filter
} from 'lucide-react';

interface CategoryFilterProps {
  categories: NewsCategory[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  newsCount: number;
}

const iconMap = {
  rss: Rss,
  play: Play,
  'gamepad-2': Gamepad2,
  newspaper: Newspaper,
};

const CategoryFilter = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange,
  newsCount 
}: CategoryFilterProps) => {
  return (
    <div className="bg-card border rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Filter className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Filtrer par type de flux</h2>
      </div>
      
      <div className="space-y-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          className="w-full justify-start gap-2"
          onClick={() => onCategoryChange(null)}
        >
          <span>Toutes</span>
          <Badge variant="secondary" className="ml-auto">
            {newsCount}
          </Badge>
        </Button>
        
        {categories.map((category) => {
          const IconComponent = iconMap[category.icon as keyof typeof iconMap];
          const isSelected = selectedCategory === category.id;
          
          return (
            <Button
              key={category.id}
              variant={isSelected ? "default" : "outline"}
              className="w-full justify-start gap-2"
              onClick={() => onCategoryChange(category.id)}
            >
              <IconComponent className="h-4 w-4" />
              <span>{category.name}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
