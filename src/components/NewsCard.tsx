
import { NewsItem } from '@/types/news';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Pin, ExternalLink, Eye, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface NewsCardProps {
  news: NewsItem;
  onTogglePin: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenArticle: (article: NewsItem) => void;
}

const NewsCard = ({
  news,
  onTogglePin,
  onMarkAsRead,
  onDelete,
  onOpenArticle
}: NewsCardProps) => {
  const { user } = useAuth();

  // Function to decode HTML entities
  const decodeHtmlEntities = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  const getSourceColor = (category: string) => {
    switch (category) {
      case 'rss':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'youtube':
        return 'bg-red-500/10 text-red-700 border-red-200';
      case 'steam':
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
      case 'actualites':
        return 'bg-green-500/10 text-green-700 border-green-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `http://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  };

  const handleCardClick = () => {
    onOpenArticle(news);
    if (!news.isRead) {
      onMarkAsRead(news.id);
    }
  };

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-300 border-l-4 cursor-pointer",
      news.isPinned && "border-l-yellow-500",
      news.isRead && "opacity-75",
      !news.isRead && "border-l-primary"
    )}>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2" onClick={handleCardClick}>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getSourceColor(news.category)}>
                {news.source}
              </Badge>
            </div>
            
            <h3 className={cn(
              "font-semibold leading-tight group-hover:text-primary transition-colors",
              news.isRead && "text-muted-foreground"
            )}>
              {decodeHtmlEntities(news.title)}
            </h3>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(news.id);
              }}
              disabled={!user}
              className={cn(
                "h-8 w-8 p-0",
                news.isPinned && "text-yellow-600",
                !user && "opacity-50 cursor-not-allowed"
              )}
            >
              <Pin className={cn("h-4 w-4", news.isPinned && "fill-current")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4" onClick={handleCardClick}>
        <div className="space-y-3">
          {news.category === 'youtube' && news.url ? (
            // Pour YouTube, afficher la miniature en pleine largeur
            <div className="w-full">
              <img
                src={getYouTubeThumbnail(news.url) || news.imageUrl}
                alt={news.title}
                className="w-full h-48 object-cover rounded-md"
                onError={(e) => {
                  // Fallback vers l'image normale ou une image par défaut
                  if (news.imageUrl) {
                    e.currentTarget.src = news.imageUrl;
                  }
                }}
              />
            </div>
          ) : news.imageUrl ? (
            <div className="w-full">
              <img
                src={news.imageUrl}
                alt={news.title}
                className="w-full h-48 object-cover rounded-md"
              />
            </div>
          ) : null}
          
          {news.category !== 'youtube' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {decodeHtmlEntities(news.description)}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            {new Date(news.publishedAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          
          <div className="flex items-center gap-2">
            {!news.isRead && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(news.id);
                }}
                disabled={!user}
                className={cn("gap-1", !user && "opacity-50 cursor-not-allowed")}
              >
                <Eye className="h-3 w-3" />
                Marquer lu
              </Button>
            )}
            
            {news.url && (
              <Button
                variant="default"
                size="sm"
                className="gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(news.url, '_blank');
                }}
              >
                <ExternalLink className="h-3 w-3" />
                Lire
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsCard;
