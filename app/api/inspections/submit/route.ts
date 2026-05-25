import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { DomicertReport } from '@/lib/pdf/report'
import { Resend } from 'resend'
import React from 'react'

const resend = new Resend(process.env.RESEND_API_KEY)

async function toBase64DataUri(url: string): Promise<string> {
  const res = await fetch(url)
  const buffer = await res.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  const contentType = res.headers.get('content-type') ?? 'image/jpeg'
  return `data:${contentType};base64,${base64}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { property, config, sections, selectedTier, inspector } = body

    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate counts
    const counts = {
      haz: sections.reduce((acc: number, s: { items: { rating: string }[] }) => acc + s.items.filter((i: { rating: string }) => i.rating === 'haz').length, 0),
      def: sections.reduce((acc: number, s: { items: { rating: string }[] }) => acc + s.items.filter((i: { rating: string }) => i.rating === 'def').length, 0),
      mon: sections.reduce((acc: number, s: { items: { rating: string }[] }) => acc + s.items.filter((i: { rating: string }) => i.rating === 'mon').length, 0),
      ok: sections.reduce((acc: number, s: { items: { rating: string }[] }) => acc + s.items.filter((i: { rating: string }) => i.rating === 'ok').length, 0),
    }

    // 1. Upsert property
    const normalizedAddress = `${property.address}, ${property.city}, ${property.provinceState} ${property.postalZip}`.toLowerCase()
    const { data: propertyRecord, error: propertyError } = await supabase
      .from('properties')
      .upsert({
        address_line1: property.address,
        city: property.city,
        province_state: property.provinceState,
        postal_zip: property.postalZip,
        country: property.country || 'CA',
        normalized_address: normalizedAddress,
        address_verified: false,
      }, { onConflict: 'normalized_address' })
      .select()
      .single()

    if (propertyError) throw new Error(`Property error: ${propertyError.message}`)

    // 2. Get company
    const { data: companyMember } = await supabase
      .from('company_members')
      .select('company_id, companies(*)')
      .eq('user_id', user.id)
      .single()

    const company = companyMember?.companies as unknown as Record<string, string> | null

    // 3. Create homeowner user if not exists
    let homeownerUserId = null
    if (property.clientEmail) {
      const { data: existingHomeowner } = await supabase
        .from('users')
        .select('id')
        .eq('email', property.clientEmail)
        .single()

      if (existingHomeowner) {
        homeownerUserId = existingHomeowner.id
      } else {
        const { data: newHomeowner } = await supabase
          .from('users')
          .insert({
            email: property.clientEmail,
            role: 'homeowner',
            is_active: true,
          })
          .select()
          .single()
        homeownerUserId = newHomeowner?.id
      }
    }

    // 4. Create inspection record
    const { data: inspection, error: inspectionError } = await supabase
      .from('inspections')
      .insert({
        property_id: propertyRecord.id,
        inspector_user_id: user.id,
        company_id: companyMember?.company_id || null,
        homeowner_user_id: homeownerUserId,
        client_name: property.clientName,
        client_email: property.clientEmail,
        client_phone: property.clientPhone,
        inspection_fee: parseFloat(property.inspectionFee) || 0,
        tier: selectedTier,
        floor_count: config.floors,
        bedroom_count: config.bedrooms,
        full_bath_count: config.fullBaths,
        half_bath_count: config.halfBaths,
        basement_type: config.basementType,
        has_garage: config.hasGarage,
        has_attic: config.hasAttic,
        has_crawlspace: config.hasCrawlspace,
        has_pool: config.hasPool,
        has_deck: config.hasDeck,
        has_central_ac: config.hasCentralAc,
        has_forced_air: config.hasForcedAir,
        has_wood_fireplace: config.hasWoodFireplace,
        has_gas_fireplace: config.hasGasFireplace,
        has_sump_pump: config.hasSumpPump,
        inspection_date: property.inspectionDate,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (inspectionError) throw new Error(`Inspection error: ${inspectionError.message}`)

    // 5. Create sections and checklist items
    for (const section of sections) {
      const { data: sectionRecord } = await supabase
        .from('inspection_sections')
        .insert({
          inspection_id: inspection.id,
          section_type: section.type,
          section_label: section.label,
          inspector_notes: section.notes,
          completion_status: 'complete',
        })
        .select()
        .single()

      if (sectionRecord && section.items.length > 0) {
        const itemsToInsert = section.items.map((item: {
          label: string
          hint: string
          rating: string | null
          notes: string
        }, idx: number) => ({
          section_id: sectionRecord.id,
          item_label: item.label,
          item_hint: item.hint,
          rating: item.rating,
          notes: item.notes,
          sort_order: idx,
        }))
        await supabase.from('checklist_items').insert(itemsToInsert)
      }
    }

    /// 6. Create report record with web token
    const webToken = crypto.randomUUID()
    const webTokenExpiry = new Date()
    webTokenExpiry.setFullYear(webTokenExpiry.getFullYear() + 2)

    const { data: report } = await supabase
      .from('reports')
      .insert({
        inspection_id: inspection.id,
        web_token: webToken,
        web_token_expires_at: webTokenExpiry.toISOString(),
        haz_count: counts.haz,
        def_count: counts.def,
        mon_count: counts.mon,
        ok_count: counts.ok,
        clean_report_badge: counts.haz === 0 && counts.def === 0,
        generated_at: new Date().toISOString(),
      })
      .select()
      .single()

    // 7. Save photos FIRST (must happen before PDF generation)
    const { photoData } = body
    const sectionPhotoMap: Record<string, { storagePath: string; caption: string | null }[]> = {}
console.log('photoData received:', JSON.stringify(Object.keys(photoData || {})))
    if (photoData && Object.keys(photoData).length > 0) {
      for (const [tempSectionId, photos] of Object.entries(photoData)) {
       const matchingSection = await supabase
          .from('inspection_sections')
          .select('id')
          .eq('inspection_id', inspection.id)
          .ilike('section_label', tempSectionId)
          .single()

        if (matchingSection.data) {
          const dbSectionId = matchingSection.data.id
          sectionPhotoMap[dbSectionId] = []

          for (let i = 0; i < (photos as { path: string; caption: string }[]).length; i++) {
            const photo = (photos as { path: string; caption: string }[])[i]
            const storagePath = photo.path
            console.log('Using photo path:', storagePath)
          await supabase.from('photos').insert({
              section_id: dbSectionId,
              storage_path_fullres: storagePath,
              uploaded_at: new Date().toISOString(),
            })
            sectionPhotoMap[dbSectionId].push({
              storagePath: storagePath,
              caption: photo.caption || null,
            })
          }
        }
      }
    }

   // 8. Fetch photos as base64, keyed by section label for PDF lookup
    const sectionLabelPhotoMap: Record<string, { src: string; caption: string | null }[]> = {}
    console.log('sectionPhotoMap keys:', Object.keys(sectionPhotoMap))

    for (const [dbSectionId, photos] of Object.entries(sectionPhotoMap)) {
      const { data: sectionRecord } = await supabase
        .from('inspection_sections')
        .select('section_label')
        .eq('id', dbSectionId)
        .single()

      if (sectionRecord) {
        const base64Photos = await Promise.all(
          photos.map(async (photo) => {
            const cleanPath = photo.storagePath.replace(/^photos\//, '')
            console.log('Creating signed URL for:', cleanPath)
            const { data: signedData, error: signedError } = await supabase.storage
              .from('photos')
              .createSignedUrl(cleanPath, 120)
            console.log('Signed URL result:', { url: !!signedData?.signedUrl, error: signedError?.message })

            if (!signedData?.signedUrl) return null
console.log('Signed URL created:', !!signedData?.signedUrl, 'for path:', photo.storagePath)
            try {
              const src = await toBase64DataUri(signedData.signedUrl)
              return { src, caption: photo.caption }
            } catch {
              return null
            }
          })
        )

        sectionLabelPhotoMap[sectionRecord.section_label] = base64Photos.filter(Boolean) as {
          src: string
          caption: string | null
        }[]
      }
    }
// Fetch company logo as base64
    let logoSrc: string | undefined
    if (company?.logo_storage_path) {
      try {
        const { data: signedLogo } = await supabase.storage
          .from('company-assets')
          .createSignedUrl(company.logo_storage_path, 120)
        if (signedLogo?.signedUrl) {
          logoSrc = await toBase64DataUri(signedLogo.signedUrl)
        }
      } catch {
        console.log('Logo fetch failed — continuing without logo')
      }
    }
    // 9. Generate PDF
    const reportData = {
      property: {
        address: property.address,
        city: property.city,
        provinceState: property.provinceState,
        postalZip: property.postalZip,
        propertyType: {
          single_family: 'Single-family home',
          semi: 'Semi-detached',
          townhouse: 'Townhouse',
          condo: 'Condo',
          multi: 'Multi-unit',
        }[property.propertyType as string] || property.propertyType,
        yearBuilt: property.yearBuilt,
        floors: config.floors,
        bedrooms: config.bedrooms,
        fullBaths: config.fullBaths,
        halfBaths: config.halfBaths,
        basementType: config.basementType,
      },
      client: {
        name: property.clientName,
        email: property.clientEmail,
      },
     inspector: {
        name: user.user_metadata?.first_name
          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
          : user.email || 'Inspector',
        companyName: company?.name || user.user_metadata?.company_name || 'Inspection Company',
        licenseNumber: company?.license_number || 'N/A',
        email: company?.email || user.email || '',
        phone: company?.phone || '',
        logoSrc,
      },
      inspection: {
        date: property.inspectionDate,
        tier: selectedTier,
        fee: property.inspectionFee,
      },
      sections: sections.map((s: { label: string; id: string; items: { label: string; rating: string | null; notes: string }[]; notes: string }) => ({
        id: s.id,
        label: s.label,
        items: s.items,
        notes: s.notes,
        photos: sectionLabelPhotoMap[s.label] ?? [],
      })),
      counts,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await (renderToBuffer as any)(
      (React.createElement as any)(DomicertReport, { data: reportData })
    )

    // 10. Store PDF in Supabase Storage
    const pdfPath = `reports/${inspection.id}/report.pdf`
    await supabase.storage
      .from('reports')
      .upload(pdfPath, pdfBuffer, { contentType: 'application/pdf', upsert: true })

    await supabase
      .from('reports')
      .update({ pdf_storage_path: pdfPath })
      .eq('id', report?.id)

    // 11. Create survey record
    const { data: surveyRecord, error: surveyError } = await supabase
      .from('surveys')
      .insert({
        inspection_id: inspection.id,
        homeowner_user_id: homeownerUserId,
        sent_at: new Date().toISOString(),
        token_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (surveyError) console.error('Survey insert error:', surveyError)

    const surveyLink = surveyRecord
      ? `${process.env.NEXT_PUBLIC_APP_URL}/survey/${surveyRecord.token}`
      : null

    // 12. Send email via Resend
    const webLink = `${process.env.NEXT_PUBLIC_APP_URL}/report/${webToken}`
    const propertyAddress = `${property.address}, ${property.city}`

    await resend.emails.send({
      from: 'Domicert <reports@domicert.ca>',
      to: property.clientEmail,
      subject: `Your Home Inspection Report — ${propertyAddress}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: #1D9E75; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Your inspection report is ready</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">${propertyAddress}</p>
          </div>

          <p style="color: #374151;">Hi ${property.clientName},</p>
          <p style="color: #374151;">Your home inspection report for <strong>${propertyAddress}</strong> has been completed by <strong>${reportData.inspector.companyName}</strong>.</p>

          <div style="background: #F9FAFB; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <h3 style="margin: 0 0 12px; color: #111827; font-size: 14px;">Summary of findings</h3>
            <div style="display: flex; gap: 12px; text-align: center;">
              <div style="flex: 1;"><div style="font-size: 24px; font-weight: bold; color: #1F2937;">${counts.haz}</div><div style="font-size: 11px; color: #6B7280;">Safety hazards</div></div>
              <div style="flex: 1;"><div style="font-size: 24px; font-weight: bold; color: #DC2626;">${counts.def}</div><div style="font-size: 11px; color: #6B7280;">Defects</div></div>
              <div style="flex: 1;"><div style="font-size: 24px; font-weight: bold; color: #D97706;">${counts.mon}</div><div style="font-size: 11px; color: #6B7280;">Monitor</div></div>
              <div style="flex: 1;"><div style="font-size: 24px; font-weight: bold; color: #1D9E75;">${counts.ok}</div><div style="font-size: 11px; color: #6B7280;">Acceptable</div></div>
            </div>
          </div>

          <p style="color: #374151;">Your full report is attached as a PDF. You can also view it online for 2 years:</p>

          <a href="${webLink}" style="display: inline-block; background: #1D9E75; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin: 8px 0;">
            View report online →
          </a>

          ${surveyLink ? `
          <div style="margin-top: 32px; padding: 20px; background: #F9FAFB; border-radius: 8px; border-left: 3px solid #1D9E75;">
            <h3 style="margin: 0 0 8px; color: #111827; font-size: 14px;">How was your experience?</h3>
            <p style="margin: 0 0 12px; color: #6B7280; font-size: 13px;">4 quick questions — takes 60 seconds. Your feedback helps us improve.</p>
            <a href="${surveyLink}" style="display: inline-block; background: white; color: #1D9E75; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 13px; border: 1px solid #1D9E75;">
              Share your feedback →
            </a>
          </div>
          ` : ''}

          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;">
          <p style="color: #9CA3AF; font-size: 12px;">
            Inspected by ${reportData.inspector.name} · ${reportData.inspector.companyName}<br>
            License: ${reportData.inspector.licenseNumber}<br>
            Report powered by <a href="https://domicert.ca" style="color: #1D9E75;">Domicert</a> · Certified · Lasting · Trusted
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `inspection-report-${property.address.replace(/\s+/g, '-').toLowerCase()}.pdf`,
          content: Buffer.from(pdfBuffer).toString('base64'),
        },
      ],
    })

    // 13. Update company inspection count
    if (companyMember?.company_id) {
      await supabase.rpc('increment_inspection_count', {
        company_id_param: companyMember.company_id
      })
    }

    return NextResponse.json({
      success: true,
      inspectionId: inspection.id,
      reportId: report?.id,
      webToken,
      webLink,
    })

  } catch (error) {
    console.error('Submission error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Submission failed' },
      { status: 500 }
    )
  }
}