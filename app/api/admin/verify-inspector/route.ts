import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      companyId,
      inspectorName,
      companyName,
      email,
      phone,
      website,
      provinceState,
      licenseNumber,
      regulatorHtml,
    } = body

    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    await resend.emails.send({
      from: 'Domicert <reports@domicert.ca>',
      to: 'domicert@outlook.com',
      subject: `New inspector signup — ${companyName} (${provinceState}) — Verification needed`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: #1D9E75; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 18px;">New inspector signup — action required</h1>
          </div>

          <h2 style="font-size: 16px; color: #111827;">Inspector details</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 6px 0; color: #6B7280; width: 140px;">Name:</td><td style="padding: 6px 0; color: #111827;"><strong>${inspectorName}</strong></td></tr>
            <tr><td style="padding: 6px 0; color: #6B7280;">Company:</td><td style="padding: 6px 0; color: #111827;"><strong>${companyName}</strong></td></tr>
            <tr><td style="padding: 6px 0; color: #6B7280;">Email:</td><td style="padding: 6px 0; color: #111827;">${email}</td></tr>
            <tr><td style="padding: 6px 0; color: #6B7280;">Phone:</td><td style="padding: 6px 0; color: #111827;">${phone || 'Not provided'}</td></tr>
            <tr><td style="padding: 6px 0; color: #6B7280;">Website:</td><td style="padding: 6px 0; color: #111827;">${website || 'Not provided'}</td></tr>
            <tr><td style="padding: 6px 0; color: #6B7280;">Province/State:</td><td style="padding: 6px 0; color: #111827;"><strong>${provinceState}</strong></td></tr>
            <tr><td style="padding: 6px 0; color: #6B7280;">License #:</td><td style="padding: 6px 0; color: #111827;"><strong>${licenseNumber || 'Not provided'}</strong></td></tr>
          </table>

          <div style="background: #F9FAFB; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px; color: #111827; font-size: 14px;">Verification instructions</h3>
            ${regulatorHtml}
          </div>

          <div style="display: flex; gap: 12px; margin-bottom: 24px;">
            <a href="${appUrl}/api/admin/approve?id=${companyId}&action=approve" 
               style="flex: 1; display: block; text-align: center; background: #1D9E75; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              ✓ Approve inspector
            </a>
            <a href="${appUrl}/api/admin/approve?id=${companyId}&action=reject" 
               style="flex: 1; display: block; text-align: center; background: #DC2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              ✗ Reject inspector
            </a>
          </div>

          <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
            This inspector can submit reports but will not appear in the directory until approved.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Verification email error:', error)
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 })
  }
}