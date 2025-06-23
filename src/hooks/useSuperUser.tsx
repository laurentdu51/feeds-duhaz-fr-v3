
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useSuperUser() {
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const checkSuperUserStatus = async () => {
    if (!user) {
      setIsSuperUser(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('is_super_user');
      
      if (error) {
        console.error('Error checking super user status:', error);
        setIsSuperUser(false);
      } else {
        setIsSuperUser(data || false);
      }
    } catch (error) {
      console.error('Error in checkSuperUserStatus:', error);
      setIsSuperUser(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSuperUserStatus();
  }, [user]);

  return {
    isSuperUser,
    loading,
    refetch: checkSuperUserStatus
  };
}
