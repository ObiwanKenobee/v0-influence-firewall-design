
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createAuditSystem } from '@/lib/audit/audit-system'

const auditSystem = createAuditSystem()

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

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const action = searchParams.get('action')

    const logs = auditSystem.getLogs({
      userId: user.id,
      action: action as any,
      limit,
      offset,
    })

    return NextResponse.json({
      success: true,
      data: {
        logs,
        total: logs.length,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('[v0] Audit logs error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch audit logs',
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
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const logEntry = auditSystem.logAction({
      userId: user.id,
      action: body.action,
      resource: body.resource,
      resourceId: body.resourceId,
      changes: body.changes || {},
      metadata: {
        ipAddress: clientIp,
        userAgent,
      },
      status: body.status || 'success',
      errorMessage: body.errorMessage,
    })

    return NextResponse.json(
      {
        success: true,
        data: logEntry,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Audit log creation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create audit log',
        },
      },
      { status: 500 }
    )
  }
}
