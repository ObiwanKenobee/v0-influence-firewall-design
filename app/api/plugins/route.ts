
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams

    const category = searchParams.get('category')
    const status = searchParams.get('status') || 'published'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase.from('plugins').select('*', { count: 'exact' })

    if (status) {
      query = query.eq('status', status)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error, count } = await query
      .order('downloads_count', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: {
        plugins: data || [],
        total: count || 0,
        page: Math.ceil(offset / limit) + 1,
        pageSize: limit,
        hasNextPage: (offset + limit) < (count || 0),
      },
    })
  } catch (error) {
    console.error('[v0] Plugins API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch plugins',
        },
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        },
        { status: 401 }
      )
    }

    const body = await request.json()

    const { data, error } = await supabase.from('plugins').insert({
      developer_id: user.id,
      name: body.name,
      slug: body.slug,
      description: body.description,
      category: body.category,
      plugin_type: body.plugin_type,
      entry_point: body.entry_point,
      manifest: body.manifest,
      permissions: body.permissions || [],
      status: 'draft',
    })

    if (error) throw error

    return NextResponse.json(
      {
        success: true,
        data: data?.[0],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Plugin creation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create plugin',
        },
      },
      { status: 500 }
    )
  }
}
