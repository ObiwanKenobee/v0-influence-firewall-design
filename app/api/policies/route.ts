
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
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

    // In a real app, this would query from database
    // For now, return standard templates
    const policies = [
      {
        id: 'policy-1',
        name: 'Strict Moderation',
        description: 'Block high-risk content',
        rules: [],
        status: 'active',
      },
      {
        id: 'policy-2',
        name: 'Balanced',
        description: 'Flag concerning content',
        rules: [],
        status: 'active',
      },
    ]

    return NextResponse.json({
      success: true,
      data: { policies },
    })
  } catch (error) {
    console.error('[v0] Policies API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch policies',
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

    // Validate policy
    if (!body.name || !body.rules) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields',
          },
        },
        { status: 400 }
      )
    }

    const policy = {
      id: `policy-${Date.now()}`,
      name: body.name,
      description: body.description,
      rules: body.rules,
      createdBy: user.id,
      status: 'active',
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(
      {
        success: true,
        data: policy,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Policy creation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create policy',
        },
      },
      { status: 500 }
    )
  }
}
