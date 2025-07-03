
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { XCircle, Trash2 } from 'lucide-react';
import { Feed } from '@/types/feed';

interface EditFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (feedData: any) => void;
  onToggleStatus?: (feed: Feed) => void;
  onDelete?: (feed: Feed) => void;
  feed: Feed;
  feedTypes: { value: string; label: string; icon: any }[];
  isSuperUser?: boolean;
}

const EditFeedModal = ({ isOpen, onClose, onSave, onToggleStatus, onDelete, feed, feedTypes, isSuperUser = false }: EditFeedModalProps) => {
  const [name, setName] = useState(feed.name);
  const [url, setUrl] = useState(feed.url);
  const [type, setType] = useState(feed.type);
  const [description, setDescription] = useState(feed.description || '');
  const [category, setCategory] = useState(feed.category);
  const [status, setStatus] = useState(feed.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      url,
      type,
      description,
      category,
      status
    });
  };

  const resetForm = () => {
    setName(feed.name);
    setUrl(feed.url);
    setType(feed.type);
    setDescription(feed.description || '');
    setCategory(feed.category);
    setStatus(feed.status);
  };

  const handleTypeChange = (value: string) => {
    setType(value as Feed['type']);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value as Feed['status']);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetForm();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier le flux</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom du flux"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="URL du flux"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {feedTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description du flux"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Catégorie</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Catégorie du flux"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="error">Erreur</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Actions Super Admin */}
          {isSuperUser && (
            <div className="border-t pt-4">
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-medium text-muted-foreground">Actions administrateur</h4>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={feed.status === 'active' ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => onToggleStatus?.(feed)}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    {feed.status === 'active' ? 'Désactiver' : 'Activer'}
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer le flux "{feed.name}" ? 
                          Cette action est irréversible et supprimera également tous les articles associés.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            onDelete?.(feed);
                            onClose();
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Supprimer définitivement
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFeedModal;
