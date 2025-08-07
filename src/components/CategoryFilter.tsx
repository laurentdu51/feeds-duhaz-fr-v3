
import { NewsCategory } from '@/types/news';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Rss, 
  Play, 
  Gamepad2, 
  Newspaper,
  Filter,
  Pin,
  Calendar,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface CategoryFilterProps {
  categories: NewsCategory[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  newsCount: number;
  pinnedCount?: number;
  articles: any[]; // Add articles to calculate counts per category
  dateFilter?: 'today' | 'yesterday' | null;
  onDateFilterChange?: (filter: 'today' | 'yesterday' | null) => void;
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
  newsCount,
  pinnedCount = 0,
  articles,
  dateFilter,
  onDateFilterChange
}: CategoryFilterProps) => {
  const { user } = useAuth();

  // Calculate count for each category
  const getCategoryCount = (categoryType: string) => {
    return articles.filter(article => article.category === categoryType).length;
  };

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
          const categoryCount = getCategoryCount(category.type);
          
          return (
            <Button
              key={category.id}
              variant={isSelected ? "default" : "outline"}
              className="w-full justify-start gap-2"
              onClick={() => onCategoryChange(category.id)}
            >
              <IconComponent className="h-4 w-4" />
              <span>{category.name}</span>
              <Badge variant="secondary" className="ml-auto">
                {categoryCount}
              </Badge>
            </Button>
          );
        })}
      </div>

      {onDateFilterChange && (
        <div className="pt-4 border-t space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtrer par date</span>
          </div>
          
          <div className="space-y-1">
            <Button
              variant={dateFilter === null ? "default" : "outline"}
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => onDateFilterChange(null)}
            >
              <span>Tous les articles</span>
            </Button>
            
            <Button
              variant={dateFilter === 'today' ? "default" : "outline"}
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => onDateFilterChange('today')}
            >
              <Clock className="h-3 w-3" />
              <span>Aujourd'hui</span>
            </Button>
            
            <Button
              variant={dateFilter === 'yesterday' ? "default" : "outline"}
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => onDateFilterChange('yesterday')}
            >
              <Calendar className="h-3 w-3" />
              <span>Hier</span>
            </Button>
          </div>
        </div>
      )}

      {user && (
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2">
            <Pin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Épinglé</span>
            <Badge variant="secondary" className="ml-auto">
              {pinnedCount > 0 ? `${pinnedCount}` : 'Aucun'}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
