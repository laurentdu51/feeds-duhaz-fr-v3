import { useState, useMemo } from 'react';
import { categories } from '@/data/mockNews';
import { useArticles } from '@/hooks/useArticles';
import { useAuth } from '@/hooks/useAuth';
import { NewsItem } from '@/types/news';
import Header from '@/components/Header';
import CategoryFilter from '@/components/CategoryFilter';
import NewsCard from '@/components/NewsCard';
import AddFeedModal from '@/components/AddFeedModal';
import ArticleModal from '@/components/ArticleModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, Filter, User, Rss } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();
  const { articles, loading, togglePin, markAsRead, deleteArticle, refetch } = useArticles();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [isAddFeedModalOpen, setIsAddFeedModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  const filteredNews = useMemo(() => {
    let filtered = articles;
    
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
  }, [articles, selectedCategory, searchQuery]);

  const pinnedCount = articles.filter(item => item.isPinned).length;
  const unreadCount = articles.filter(item => !item.isRead).length;

  const handleRefresh = () => {
    refetch();
    toast.success("Flux actualisés");
  };

  const handleAddFeed = (feedData: any) => {
    console.log('Nouveau flux ajouté:', feedData);
    toast.success(`Flux "${feedData.name}" ajouté avec succès!`);
  };

  const handleOpenArticle = (article: NewsItem) => {
    setSelectedArticle(article);
    setIsArticleModalOpen(true);
  };

  const handleCloseArticleModal = () => {
    setIsArticleModalOpen(false);
    setSelectedArticle(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Rss className="h-6 w-6 animate-spin text-primary" />
          <p>Chargement des articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pinnedCount={pinnedCount}
        onAddFeedClick={() => setIsAddFeedModalOpen(true)}
      />
      
      <main className="container mx-auto px-4 py-6">
        {/* Message pour les utilisateurs non connectés */}
        {!user && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">Vous consultez les derniers articles publics</p>
                  <p className="text-sm text-blue-700">
                    Connectez-vous pour voir uniquement les articles de vos flux suivis et personnaliser votre expérience.
                  </p>
                </div>
                <Link to="/auth">
                  <Button size="sm">
                    Se connecter
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Message pour les utilisateurs connectés sans articles */}
        {user && articles.length === 0 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Rss className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-900">Aucun article trouvé</p>
                  <p className="text-sm text-yellow-700">
                    Vous ne suivez aucun flux pour le moment. Visitez la page de gestion des flux pour commencer à suivre des sources d'actualités.
                  </p>
                </div>
                <Link to="/feeds">
                  <Button size="sm">
                    Gérer les flux
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className={`lg:col-span-1 space-y-6 ${!showFilters && 'hidden lg:block'}`}>
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              newsCount={articles.length}
            />
            
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm">Statistiques</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total articles</span>
                  <Badge variant="outline">{articles.length}</Badge>
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
                  {user ? 'Vos flux suivis' : 'Derniers articles'}
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
                    onTogglePin={togglePin}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteArticle}
                    onOpenArticle={handleOpenArticle}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {user && (
        <AddFeedModal 
          isOpen={isAddFeedModalOpen}
          onClose={() => setIsAddFeedModalOpen(false)}
          onAddFeed={handleAddFeed}
          categories={categories}
        />
      )}

      <ArticleModal 
        isOpen={isArticleModalOpen}
        onClose={handleCloseArticleModal}
        article={selectedArticle}
      />
    </div>
  );
};

export default Index;
