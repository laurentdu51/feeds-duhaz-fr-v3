
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Settings, 
  User,
  Rss
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  pinnedCount: number;
  onAddFeedClick: () => void;
}

const Header = ({ searchQuery, onSearchChange, pinnedCount, onAddFeedClick }: HeaderProps) => {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Rss className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Feeds.Duhaz.fr</h1>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span>•</span>
              <span>Liste des flux rss surveillé</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={onAddFeedClick}
            >
              <Plus className="h-4 w-4" />
              Ajouter un Flux
            </Button>
            
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Mon profil</span>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Épinglé</span>
            <Badge variant="secondary">
              {pinnedCount > 0 ? `${pinnedCount}` : 'Aucun'}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
