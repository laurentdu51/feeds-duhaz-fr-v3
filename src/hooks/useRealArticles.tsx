
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { NewsItem } from '@/types/news';
import { toast } from 'sonner';

export function useRealArticles() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchArticles = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching articles...', { user: !!user });
      
      if (user) {
        // For authenticated users, fetch articles from their followed feeds
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
          // Si l'utilisateur ne suit aucun flux, on affiche les articles récents non lus
          const { data: recentArticles, error: recentError } = await supabase
            .from('articles')
            .select(`
              *,
              feeds!inner(name, category),
              user_articles(is_read, is_pinned)
            `)
            .order('published_at', { ascending: false })
            .limit(20);

          if (recentError) {
            console.error('❌ Error fetching recent articles:', recentError);
            toast.error('Erreur lors du chargement des articles');
            return;
          }

          console.log('📰 Recent articles for user with no followed feeds:', recentArticles?.length);
          
          // Transform to NewsItem format and filter out read articles
          const transformedArticles: NewsItem[] = recentArticles
            ?.filter(article => !article.user_articles[0]?.is_read) // Filter out read articles
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
          return;
        }

        // Fetch articles from followed feeds with user interactions, excluding read articles
        const { data: articlesData, error: articlesError } = await supabase
          .from('articles')
          .select(`
            *,
            feeds!inner(name, category),
            user_articles(is_read, is_pinned)
          `)
          .in('feed_id', followedFeedIds)
          .order('published_at', { ascending: false })
          .limit(100);

        if (articlesError) {
          console.error('❌ Error fetching articles:', articlesError);
          toast.error('Erreur lors du chargement des articles');
          return;
        }

        console.log('📰 Articles found for followed feeds:', articlesData?.length);

        // Transform to NewsItem format and filter out read articles
        const transformedArticles: NewsItem[] = articlesData
          ?.filter(article => !article.user_articles[0]?.is_read) // Filter out read articles
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
        // For visitors, show recent articles from all feeds
        console.log('👤 Loading articles for visitor');
        const { data: articlesData, error: articlesError } = await supabase
          .from('articles')
          .select(`
            *,
            feeds(name, category)
          `)
          .not('feeds', 'is', null)
          .order('published_at', { ascending: false })
          .limit(20);

        if (articlesError) {
          console.error('❌ Error fetching public articles:', articlesError);
          toast.error('Erreur lors du chargement des articles');
          return;
        }

        console.log('📰 Public articles found:', articlesData?.length);

        // Transform to NewsItem format - filter out articles without feeds
        const transformedArticles: NewsItem[] = articlesData
          ?.filter(article => article.feeds) // Only keep articles with valid feeds
          ?.map(article => ({
            id: article.id,
            title: article.title,
            description: article.description || '',
            content: article.content || '',
            source: article.feeds.name,
            category: article.feeds.category as NewsItem['category'],
            publishedAt: article.published_at,
            readTime: article.read_time || 5,
            isPinned: false,
            isRead: false,
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

      // Remove the article from the list instead of just marking it as read
      setArticles(prev => prev.filter(item => item.id !== articleId));
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
  }, [user]);

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
