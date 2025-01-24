import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'
import { summarizeWithMistral } from '@/lib/mistral'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { v4 as uuidv4 } from 'uuid'

async function fetchUrlContent(url: string): Promise<string> {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    $('script, style').remove();
    return $('body').text().trim();
  } catch (error) {
    console.error('Error fetching URL content:', error);
    throw new Error('Failed to fetch URL content');
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookies() })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const content = formData.get('content') as string
  const url = formData.get('url') as string
  const platforms = JSON.parse(formData.get('platforms') as string)
  const file = formData.get('file') as File | null
  const summaryType = formData.get('summaryType') as string
  const tone = formData.get('tone') as string
  const contentLength = formData.get('contentLength') as string

  let textToProcess = content;
  if (url) {
    textToProcess = await fetchUrlContent(url);
  }

  if (file) {
    const fileName = `${uuidv4()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('temp-uploads')
      .upload(fileName, file)

    if (error) {
      console.error('Error uploading file:', error)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('temp-uploads')
      .getPublicUrl(fileName)

    textToProcess = `[File: ${publicUrl}]`
  }

  const summaries: Record<string, string> = {}

  for (const platform of platforms) {
    try {
      summaries[platform] = await summarizeWithMistral(
        textToProcess,
        platform,
        contentLength,
        summaryType,
        tone
      )
    } catch (error) {
      console.error(`Error summarizing for ${platform}:`, error)
      summaries[platform] = "Error generating summary. Please try again later."
    }
  }

  return NextResponse.json({ summaries, textToProcess })
}

