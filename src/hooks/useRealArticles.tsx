
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { NewsItem } from '@/types/news';
import { toast } from 'sonner';

export function useRealArticles(dateFilter?: 'today' | 'yesterday' | null, showFollowedOnly?: boolean, showReadArticles?: boolean) {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchArticles = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching articles...', { user: !!user, dateFilter, showFollowedOnly });
      
      // Calculate date ranges for filtering
      let dateStart = null;
      let dateEnd = null;
      
      if (dateFilter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dateStart = today.toISOString();
        today.setHours(23, 59, 59, 999);
        dateEnd = today.toISOString();
      } else if (dateFilter === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        dateStart = yesterday.toISOString();
        yesterday.setHours(23, 59, 59, 999);
        dateEnd = yesterday.toISOString();
      }
      
      if (user && showFollowedOnly) {
        // For authenticated users wanting only followed feeds
        const { data: userFeeds, error: userFeedsError } = await supabase
          .from('user_feeds')
          .select('feed_id')
          .eq('user_id', user.id)
          .eq('is_followed', true);

        if (userFeedsError) {
          console.error('❌ Error fetching user feeds:', userFeedsError);
          toast.error('Erreur lors du chargement de vos flux');
          return;
        }

        console.log('📋 User followed feeds:', userFeeds);
        const followedFeedIds = userFeeds?.map(uf => uf.feed_id) || [];
        
        if (followedFeedIds.length === 0) {
          console.log('⚠️ No followed feeds found for user');
          setArticles([]);
          return;
        }

        // Fetch pinned articles first (without date filter)
        const pinnedQuery = supabase
          .from('articles')
          .select(`
            *,
            feeds!inner(name, category),
            user_articles!inner(is_read, is_pinned)
          `)
          .in('feed_id', followedFeedIds)
          .eq('user_articles.user_id', user.id)
          .eq('user_articles.is_pinned', true)
          .eq('user_articles.is_read', false);

        const { data: pinnedArticles, error: pinnedError } = await pinnedQuery
          .order('published_at', { ascending: false })
          .limit(50);

        if (pinnedError) {
          console.error('❌ Error fetching pinned articles:', pinnedError);
        }

        // Fetch regular articles (with date filter if specified)
        let regularQuery = supabase
          .from('articles')
          .select(`
            *,
            feeds!inner(name, category),
            user_articles(is_read, is_pinned)
          `)
          .in('feed_id', followedFeedIds);
        
        // Apply date filter to regular articles only
        if (dateStart && dateEnd) {
          regularQuery = regularQuery.gte('published_at', dateStart).lte('published_at', dateEnd);
        }
        
        const { data: regularArticles, error: regularError } = await regularQuery
          .order('published_at', { ascending: false })
          .limit(100);

        if (regularError) {
          console.error('❌ Error fetching regular articles:', regularError);
          toast.error('Erreur lors du chargement des articles');
          return;
        }

        // Combine articles and remove duplicates
        const allArticles = [...(pinnedArticles || []), ...(regularArticles || [])];
        const uniqueArticles = allArticles.filter((article, index, self) => 
          index === self.findIndex(a => a.id === article.id)
        );

        console.log('📰 Articles found:', {
          pinned: pinnedArticles?.length || 0,
          regular: regularArticles?.length || 0,
          unique: uniqueArticles.length
        });

        // Transform to NewsItem format and conditionally filter read articles
        const transformedArticles: NewsItem[] = uniqueArticles
          ?.filter(article => showReadArticles || !article.user_articles[0]?.is_read)
          ?.map(article => ({
            id: article.id,
            title: article.title,
            description: article.description || '',
            content: article.content || '',
            source: article.feeds.name,
            category: article.feeds.category as NewsItem['category'],
            publishedAt: article.published_at,
            readTime: article.read_time || 5,
            isPinned: article.user_articles[0]?.is_pinned || false,
            isRead: article.user_articles[0]?.is_read || false,
            url: article.url || undefined,
            imageUrl: article.image_url || undefined
          })) || [];

        setArticles(transformedArticles);
      } else {
        // For users wanting all articles or visitors - show all articles from all feeds
        console.log('👤 Loading all articles (visitor or showFollowedOnly=false)');
        
        let pinnedArticles = [];
        let regularArticles = [];

        if (user) {
          // Fetch pinned articles first (without date filter) for authenticated users
          const pinnedQuery = supabase
            .from('articles')
            .select(`
              *,
              feeds!inner(name, category),
              user_articles!inner(is_read, is_pinned)
            `)
            .eq('user_articles.user_id', user.id)
            .eq('user_articles.is_pinned', true);

          const { data: pinnedData, error: pinnedError } = await pinnedQuery
            .order('published_at', { ascending: false })
            .limit(50);

          if (pinnedError) {
            console.error('❌ Error fetching pinned articles:', pinnedError);
          } else {
            pinnedArticles = pinnedData || [];
          }
        }

        // Fetch regular articles (with date filter if specified)
        let regularQuery = supabase
          .from('articles')
          .select(`
            *,
            feeds!inner(name, category),
            user_articles(is_read, is_pinned)
          `);
        
        // Apply date filter to regular articles only
        if (dateStart && dateEnd) {
          regularQuery = regularQuery.gte('published_at', dateStart).lte('published_at', dateEnd);
        }
        
        const { data: regularData, error: regularError } = await regularQuery
          .order('published_at', { ascending: false })
          .limit(100);

        if (regularError) {
          console.error('❌ Error fetching regular articles:', regularError);
          toast.error('Erreur lors du chargement des articles');
          return;
        }

        regularArticles = regularData || [];

        // Combine articles and remove duplicates
        const allArticles = [...pinnedArticles, ...regularArticles];
        const uniqueArticles = allArticles.filter((article, index, self) => 
          index === self.findIndex(a => a.id === article.id)
        );

        console.log('📰 All articles found:', {
          pinned: pinnedArticles.length,
          regular: regularArticles.length,
          unique: uniqueArticles.length
        });

        // Transform to NewsItem format and conditionally filter read articles
        const transformedArticles: NewsItem[] = uniqueArticles
          ?.filter(article => article.feeds && (showReadArticles || !article.user_articles[0]?.is_read))
          ?.map(article => ({
            id: article.id,
            title: article.title,
            description: article.description || '',
            content: article.content || '',
            source: article.feeds.name,
            category: article.feeds.category as NewsItem['category'],
            publishedAt: article.published_at,
            readTime: article.read_time || 5,
            isPinned: user ? (article.user_articles[0]?.is_pinned || false) : false,
            isRead: user ? (article.user_articles[0]?.is_read || false) : false,
            url: article.url || undefined,
            imageUrl: article.image_url || undefined
          })) || [];

        setArticles(transformedArticles);
      }
    } catch (error) {
      console.error('💥 Error in fetchArticles:', error);
      toast.error('Erreur lors du chargement des articles');
    } finally {
      setLoading(false);
    }
  };

  const togglePin = async (articleId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour épingler un article');
      return;
    }

    try {
      const article = articles.find(a => a.id === articleId);
      if (!article) return;

      const { error } = await supabase
        .from('user_articles')
        .upsert({
          user_id: user.id,
          article_id: articleId,
          is_pinned: !article.isPinned,
          is_read: article.isRead
        }, {
          onConflict: 'user_id,article_id'
        });

      if (error) {
        toast.error('Erreur lors de la mise à jour');
        return;
      }

      setArticles(prev => prev.map(item => 
        item.id === articleId ? { ...item, isPinned: !item.isPinned } : item
      ));
      
      toast.success(article.isPinned ? "Article retiré des épinglés" : "Article épinglé");
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const markAsRead = async (articleId: string) => {
    if (!user) return;

    try {
      const article = articles.find(a => a.id === articleId);
      if (!article || article.isRead) return;

      const { error } = await supabase
        .from('user_articles')
        .upsert({
          user_id: user.id,
          article_id: articleId,
          is_read: true,
          is_pinned: article.isPinned,
          read_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,article_id'
        });

      if (error) {
        console.error('Error marking as read:', error);
        return;
      }

      // Update local state: remove if not showing read articles, otherwise mark as read
      if (!showReadArticles) {
        setArticles(prev => prev.filter(item => item.id !== articleId));
        toast.success("Article marqué comme lu");
      } else {
        setArticles(prev => prev.map(item => item.id === articleId ? { ...item, isRead: true } : item));
        toast.success("Article marqué comme lu");
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteArticle = async (articleId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour supprimer un article');
      return;
    }

    try {
      // Remove from user's view by deleting user_articles record
      const { error } = await supabase
        .from('user_articles')
        .delete()
        .eq('user_id', user.id)
        .eq('article_id', articleId);

      if (error) {
        toast.error('Erreur lors de la suppression');
        return;
      }

      setArticles(prev => prev.filter(item => item.id !== articleId));
      toast.success("Article supprimé de votre vue");
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const fetchRSSContent = async (feedId: string, feedUrl: string) => {
    try {
      toast.info('Récupération du contenu RSS...');
      
      const { data, error } = await supabase.functions.invoke('fetch-rss', {
        body: { feedId, feedUrl }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast.success(`${data.articlesProcessed} articles récupérés`);
        await fetchArticles(); // Refresh articles
      } else {
        throw new Error(data.error || 'Erreur lors de la récupération RSS');
      }
    } catch (error) {
      console.error('Error fetching RSS:', error);
      toast.error('Erreur lors de la récupération du contenu RSS');
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [user, dateFilter, showFollowedOnly, showReadArticles]);

  return {
    articles,
    loading,
    togglePin,
    markAsRead,
    deleteArticle,
    refetch: fetchArticles,
    fetchRSSContent
  };
}
