import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { analyzeEmails } from '@/lib/newsletter-detector'

export const maxDuration = 300 // 5 minutes max

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    return new Response('Unauthorized', { status: 401 })
  }

  const params = request.nextUrl.searchParams
  const maxEmails = Math.min(
    parseInt(params.get('maxEmails') ?? '500', 10),
    2000
  )

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          )
        } catch {
          // controller already closed
        }
      }

      try {
        send({ type: 'status', message: 'Verbinde mit Gmail…' })

        const result = await analyzeEmails(
          session.accessToken!,
          maxEmails,
          (processed, total) => {
            send({ type: 'progress', processed, total })
          }
        )

        send({ type: 'complete', result })
      } catch (error) {
        send({
          type: 'error',
          message: error instanceof Error ? error.message : 'Unbekannter Fehler',
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
