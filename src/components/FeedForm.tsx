
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DialogFooter } from '@/components/ui/dialog';
import { convertYouTubeToRSS, fetchYouTubeChannelName } from '@/utils/youtube';
import { feedTypeOptions } from './FeedTypeOptions';
import { NewsCategory } from '@/types/news';

interface FeedFormData {
  name: string;
  url: string;
  category: string;
  description?: string;
}

interface FeedFormProps {
  selectedType: string;
  onSubmit: (feedData: any) => void;
  onCancel: () => void;
  categories: NewsCategory[];
}

const FeedForm = ({ selectedType, onSubmit, onCancel, categories }: FeedFormProps) => {
  const [isLoadingChannelName, setIsLoadingChannelName] = useState(false);
  const [urlWarning, setUrlWarning] = useState<string | null>(null);
  
  const form = useForm<FeedFormData>({
    defaultValues: {
      name: '',
      url: '',
      category: '',
      description: '',
    },
  });

  const handleSubmit = (data: FeedFormData) => {
    let processedUrl = data.url;
    
    // If it's a YouTube feed, convert the URL to RSS format
    if (selectedType === 'youtube') {
      processedUrl = convertYouTubeToRSS(data.url);
      console.log('YouTube URL converted:', { original: data.url, converted: processedUrl });
    }
    
    const feedData = {
      ...data,
      url: processedUrl,
      type: selectedType,
      id: Date.now().toString(), // Simple ID generation
    };
    
    onSubmit(feedData);
  };

  const handleUrlChange = async (url: string) => {
    form.setValue('url', url);
    setUrlWarning(null);
    
    // If it's a YouTube URL and we don't have a name yet, try to fetch it
    if (selectedType === 'youtube' && url && !form.getValues('name')) {
      const isYouTubeUrl = url.includes('youtube.com');
      if (isYouTubeUrl) {
        setIsLoadingChannelName(true);
        
        // Check if it's a custom username that might not work directly
        if (url.includes('/@') && !url.includes('/channel/')) {
          setUrlWarning('Note: Les URL avec @username peuvent nécessiter l\'ID de chaîne réel (UC...) pour fonctionner. Si le flux ne fonctionne pas, trouvez l\'ID de chaîne sur YouTube.');
        }
        
        const channelName = await fetchYouTubeChannelName(url);
        if (channelName) {
          form.setValue('name', channelName);
        }
        setIsLoadingChannelName(false);
      }
    }
  };

  const selectedTypeOption = feedTypeOptions.find(option => option.value === selectedType);

  const getUrlPlaceholder = () => {
    switch (selectedType) {
      case 'youtube':
        return 'https://www.youtube.com/@channelname ou https://www.youtube.com/channel/UCxxxxx';
      case 'rss-auto':
      case 'rss-manual':
        return 'https://example.com/feed.xml';
      default:
        return 'https://...';
    }
  };

  const getUrlHelperText = () => {
    if (selectedType === 'youtube') {
      return 'Pour de meilleurs résultats, utilisez l\'URL avec l\'ID de chaîne (commençant par UC...) si possible';
    }
    return null;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          {selectedTypeOption && (
            <>
              <div className={`p-2 rounded ${selectedTypeOption.color} text-white`}>
                <selectedTypeOption.icon className="h-4 w-4" />
              </div>
              <span className="font-medium">{selectedTypeOption.label}</span>
            </>
          )}
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nom du flux
                {isLoadingChannelName && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (détection automatique...)
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nom du flux..." 
                  {...field} 
                  required
                  disabled={isLoadingChannelName}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder={getUrlPlaceholder()}
                  type="url"
                  {...field} 
                  onChange={(e) => handleUrlChange(e.target.value)}
                  required
                />
              </FormControl>
              {getUrlHelperText() && (
                <p className="text-xs text-muted-foreground mt-1">
                  {getUrlHelperText()}
                </p>
              )}
              {urlWarning && (
                <p className="text-xs text-yellow-600 mt-1">
                  ⚠️ {urlWarning}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optionnel)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Description du flux..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoadingChannelName}>
            Ajouter le flux
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default FeedForm;
