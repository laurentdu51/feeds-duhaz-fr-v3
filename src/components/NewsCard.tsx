
import { NewsItem } from '@/types/news';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Pin, 
  ExternalLink,
  Eye,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsCardProps {
  news: NewsItem;
  onTogglePin: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NewsCard = ({ news, onTogglePin, onMarkAsRead, onDelete }: NewsCardProps) => {
  const getSourceColor = (category: string) => {
    switch (category) {
      case 'rss': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'youtube': return 'bg-red-500/10 text-red-700 border-red-200';
      case 'steam': return 'bg-gray-500/10 text-gray-700 border-gray-200';
      case 'actualites': return 'bg-green-500/10 text-green-700 border-green-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-300 border-l-4",
      news.isPinned && "border-l-yellow-500",
      news.isRead && "opacity-75",
      !news.isRead && "border-l-primary"
    )}>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getSourceColor(news.category)}>
                {news.source}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {news.readTime} min
              </div>
            </div>
            
            <h3 className={cn(
              "font-semibold leading-tight group-hover:text-primary transition-colors",
              news.isRead && "text-muted-foreground"
            )}>
              {news.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTogglePin(news.id)}
              className={cn(
                "h-8 w-8 p-0",
                news.isPinned && "text-yellow-600"
              )}
            >
              <Pin className={cn("h-4 w-4", news.isPinned && "fill-current")} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(news.id)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {news.description}
        </p>
        
        <div className="flex items-center justify-between">
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
                onClick={() => onMarkAsRead(news.id)}
                className="gap-1"
              >
                <Eye className="h-3 w-3" />
                Marquer lu
              </Button>
            )}
            
            {news.url && (
              <Button variant="default" size="sm" className="gap-1">
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
