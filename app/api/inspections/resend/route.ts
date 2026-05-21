import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { inspectionId, clientEmail, clientName, address } = await request.json()

    const supabase = await createClient()

    // Verify the requesting user owns this inspection
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: inspection } = await supabase
      .from('inspections')
      .select('inspector_user_id')
      .eq('id', inspectionId)
      .single()

    if (!inspection || inspection.inspector_user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the report and PDF
    const { data: report } = await supabase
      .from('reports')
      .select('pdf_storage_path, web_token')
      .eq('inspection_id', inspectionId)
      .single()

    if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

    // Try to download PDF from storage, regenerate if not found
    let pdfBuffer: ArrayBuffer

    const { data: pdfData } = await supabase.storage
      .from('reports')
      .download(report.pdf_storage_path)

    if (pdfData) {
      pdfBuffer = await pdfData.arrayBuffer()
    } else {
      // PDF not in storage — regenerate it
      const { data: fullInspection } = await supabase
        .from('inspections')
        .select(`
          *,
          properties(*),
          companies(*),
          inspection_sections(*, checklist_items(*))
        `)
        .eq('id', inspectionId)
        .single()

      if (!fullInspection) return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })

      const counts = {
        haz: 0, def: 0, mon: 0, ok: 0
      }
      fullInspection.inspection_sections?.forEach((s: {checklist_items: {rating: string}[]}) => {
        s.checklist_items?.forEach((i: {rating: string}) => {
          if (i.rating === 'haz') counts.haz++
          else if (i.rating === 'def') counts.def++
          else if (i.rating === 'mon') counts.mon++
          else if (i.rating === 'ok') counts.ok++
        })
      })

      const reportData = {
        property: {
          address: fullInspection.properties?.address_line1 || '',
          city: fullInspection.properties?.city || '',
          provinceState: fullInspection.properties?.province_state || '',
          postalZip: fullInspection.properties?.postal_zip || '',
          propertyType: fullInspection.property_type || 'Single-family home',
          yearBuilt: fullInspection.year_built || '',
          floors: fullInspection.floor_count || 1,
          bedrooms: fullInspection.bedroom_count || 0,
          fullBaths: fullInspection.full_bath_count || 0,
          halfBaths: fullInspection.half_bath_count || 0,
          basementType: fullInspection.basement_type || 'none',
        },
        client: {
          name: fullInspection.client_name,
          email: fullInspection.client_email,
        },
        inspector: {
          name: user.user_metadata?.first_name
            ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
            : user.email || 'Inspector',
          companyName: fullInspection.companies?.name || 'Inspection Company',
          licenseNumber: fullInspection.companies?.license_number || 'N/A',
          email: fullInspection.companies?.email || user.email || '',
          phone: fullInspection.companies?.phone || '',
        },
        inspection: {
          date: fullInspection.inspection_date,
          tier: fullInspection.tier,
          fee: fullInspection.inspection_fee?.toString() || '0',
        },
        sections: fullInspection.inspection_sections?.map((s: {
          id: string
          section_label: string
          inspector_notes: string
          checklist_items: {id: string, item_label: string, rating: string | null, notes: string}[]
        }) => ({
          id: s.id,
          label: s.section_label,
          notes: s.inspector_notes || '',
          items: s.checklist_items?.map(i => ({
            id: i.id,
            label: i.item_label,
            rating: i.rating,
            notes: i.notes || '',
          })) || [],
        })) || [],
        counts,
      }

      const { renderToBuffer } = await import('@react-pdf/renderer')
      const React = await import('react')
      const { DomicertReport } = await import('@/lib/pdf/report')

      const generatedBuffer = await renderToBuffer(
        React.default.createElement(DomicertReport, { data: reportData })
      )

      // Store for future use
      await supabase.storage
        .from('reports')
        .upload(report.pdf_storage_path, generatedBuffer, {
          contentType: 'application/pdf',
          upsert: true,
        })

      pdfBuffer = generatedBuffer.buffer
    }
    const webLink = `${process.env.NEXT_PUBLIC_APP_URL}/report/${report.web_token}`

    // Resend the email
    await resend.emails.send({
      from: 'Domicert <reports@domicert.ca>',
      to: clientEmail,
      subject: `Your Home Inspection Report — ${address} (resent)`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: #1D9E75; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Your inspection report</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">${address}</p>
          </div>
          <p style="color: #374151;">Hi ${clientName},</p>
          <p style="color: #374151;">Here is a resent copy of your home inspection report for <strong>${address}</strong>.</p>
          <p style="color: #374151;">Your full report is attached as a PDF. You can also view it online:</p>
          <a href="${webLink}" style="display: inline-block; background: #1D9E75; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin: 8px 0;">
            View report online →
          </a>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;">
          <p style="color: #9CA3AF; font-size: 12px;">
            Report powered by <a href="https://domicert.ca" style="color: #1D9E75;">Domicert</a> · Certified · Lasting · Trusted
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `inspection-report-${address.replace(/\s+/g, '-').toLowerCase()}.pdf`,
          content: Buffer.from(pdfBuffer).toString('base64'),
        },
      ],
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Resend error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Resend failed' },
      { status: 500 }
    )
  }
}