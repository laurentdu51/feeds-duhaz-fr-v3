
import { useState, useMemo } from 'react';
import { newsItems, categories } from '@/data/mockNews';
import { NewsItem } from '@/types/news';
import Header from '@/components/Header';
import CategoryFilter from '@/components/CategoryFilter';
import NewsCard from '@/components/NewsCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [news, setNews] = useState<NewsItem[]>(newsItems);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  const filteredNews = useMemo(() => {
    let filtered = news;
    
    if (selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory);
      if (category) {
        filtered = filtered.filter(item => item.category === category.type);
      }
    }
    
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.source.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }, [news, selectedCategory, searchQuery]);

  const pinnedCount = news.filter(item => item.isPinned).length;
  const unreadCount = news.filter(item => !item.isRead).length;

  const handleTogglePin = (id: string) => {
    setNews(prev => prev.map(item => 
      item.id === id ? { ...item, isPinned: !item.isPinned } : item
    ));
    toast.success("Article épinglé mis à jour");
  };

  const handleMarkAsRead = (id: string) => {
    setNews(prev => prev.map(item => 
      item.id === id ? { ...item, isRead: true } : item
    ));
    toast.success("Article marqué comme lu");
  };

  const handleDelete = (id: string) => {
    setNews(prev => prev.filter(item => item.id !== id));
    toast.success("Article supprimé");
  };

  const handleRefresh = () => {
    toast.success("Flux actualisés");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pinnedCount={pinnedCount}
      />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className={`lg:col-span-1 space-y-6 ${!showFilters && 'hidden lg:block'}`}>
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              newsCount={news.length}
            />
            
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm">Statistiques</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total articles</span>
                  <Badge variant="outline">{news.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Non lus</span>
                  <Badge variant="default">{unreadCount}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Épinglés</span>
                  <Badge variant="secondary">{pinnedCount}</Badge>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">
                  {selectedCategory ? 
                    categories.find(c => c.id === selectedCategory)?.name : 
                    'Tous les flux'
                  }
                </h2>
                <Badge variant="outline">
                  {filteredNews.length} article{filteredNews.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filtres
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Actualiser
                </Button>
              </div>
            </div>
            
            {filteredNews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">Aucun article trouvé</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Essayez de modifier vos filtres ou votre recherche
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNews.map((item) => (
                  <NewsCard
                    key={item.id}
                    news={item}
                    onTogglePin={handleTogglePin}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
