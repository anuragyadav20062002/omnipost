import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

export async function schedulePost({
  userId,
  postId,
  platform,
  content,
  scheduledFor,
  imageUrl
}: {
  userId: string
  postId: string
  platform: string
  content: string
  scheduledFor: string
  imageUrl?: string | null
}) {
  const supabase = createClientComponentClient<Database>()

  try {
    const { data, error } = await supabase
      .rpc('create_scheduled_post', {
        p_user_id: userId,
        p_post_id: postId,
        p_platform: platform,
        p_content: content,
        p_scheduled_for: scheduledFor,
        p_image_url: imageUrl || null,
        p_metadata: {}
      })

    if (error) {
      console.error('Error in schedulePost:', error);
      return { data: null, updated: false, error };
    }

    const isUpdated = data && data.length > 0 && data[0].updated_at !== data[0].created_at;

    return { 
      data: data && data.length > 0 ? data[0] : null, 
      updated: isUpdated,
      error: null 
    };
  } catch (error) {
    console.error('Unexpected error in schedulePost:', error);
    return { data: null, updated: false, error };
  }
}

