
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
  Clock,
  Heart
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
  showFollowedOnly?: boolean;
  onShowFollowedOnlyChange?: (showFollowedOnly: boolean) => void;
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
  onDateFilterChange,
  showFollowedOnly,
  onShowFollowedOnlyChange
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
      
      {(onDateFilterChange || (user && onShowFollowedOnlyChange) || user) && (
        <div className="pt-4 border-t space-y-3">
          <div className="flex flex-wrap items-start gap-4">
            
            {/* Section 1: Filtres d'affichage */}
            {user && onShowFollowedOnlyChange && (
              <div className="flex flex-col gap-2 min-w-fit">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Affichage</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={!showFollowedOnly ? "default" : "outline"}
                    size="sm"
                    className="justify-start gap-2 whitespace-nowrap"
                    onClick={() => onShowFollowedOnlyChange(false)}
                  >
                    Tous les flux
                  </Button>
                  <Button
                    variant={showFollowedOnly ? "default" : "outline"}
                    size="sm"
                    className="justify-start gap-2 whitespace-nowrap"
                    onClick={() => onShowFollowedOnlyChange(true)}
                  >
                    <Heart className="h-3 w-3" />
                    Flux suivis uniquement
                  </Button>
                </div>
              </div>
            )}

            {/* Section 2: Filtres de date */}
            {onDateFilterChange && (
              <div className="flex flex-col gap-2 min-w-fit">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Période</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={dateFilter === null ? "default" : "outline"}
                    size="sm"
                    className="justify-start gap-2 whitespace-nowrap"
                    onClick={() => onDateFilterChange(null)}
                  >
                    Tous les articles
                  </Button>
                  <Button
                    variant={dateFilter === 'today' ? "default" : "outline"}
                    size="sm"
                    className="justify-start gap-2 whitespace-nowrap"
                    onClick={() => onDateFilterChange('today')}
                  >
                    <Clock className="h-3 w-3" />
                    Aujourd'hui
                  </Button>
                  <Button
                    variant={dateFilter === 'yesterday' ? "default" : "outline"}
                    size="sm"
                    className="justify-start gap-2 whitespace-nowrap"
                    onClick={() => onDateFilterChange('yesterday')}
                  >
                    <Calendar className="h-3 w-3" />
                    Hier
                  </Button>
                </div>
              </div>
            )}

            {/* Section 3: Compteur d'épinglés */}
            {user && (
              <div className="flex flex-col gap-2 min-w-fit">
                <div className="flex items-center gap-2 mb-1">
                  <Pin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Épinglés</span>
                </div>
                <Badge variant="secondary" className="w-fit">
                  {pinnedCount > 0 ? `${pinnedCount}` : 'Aucun'}
                </Badge>
              </div>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
};

export default CategoryFilter;
