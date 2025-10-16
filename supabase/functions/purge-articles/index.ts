import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting automatic article purge...');

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call the purge function
    const { data, error } = await supabase.rpc('purge_old_articles');

    if (error) {
      console.error('Error calling purge_old_articles:', error);
      throw error;
    }

    console.log('Purge completed successfully:', data);

    const result = data[0];
    const deletedCount = result.deleted_count;
    const adminEmails = result.admin_emails;

    console.log(`Deleted ${deletedCount} articles`);
    console.log(`Admin emails:`, adminEmails);

    // Send email report to admins
    if (adminEmails && adminEmails.length > 0) {
      console.log('Sending purge report to admins...');
      
      const emailResponse = await supabase.functions.invoke('send-purge-report', {
        body: {
          deletedCount,
          adminEmails,
          timestamp: new Date().toISOString()
        }
      });

      if (emailResponse.error) {
        console.error('Error sending purge report:', emailResponse.error);
      } else {
        console.log('Purge report sent successfully');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        deletedCount,
        reportSent: adminEmails && adminEmails.length > 0
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in purge-articles function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
