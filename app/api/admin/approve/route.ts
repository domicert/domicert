import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const companyId = searchParams.get('id')
  const action = searchParams.get('action')

  if (!companyId || !action) {
    return new NextResponse('Missing parameters', { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get company details
  const { data: company } = await supabase
    .from('companies')
    .select('name, email, owner_user_id')
    .eq('id', companyId)
    .single()

  if (!company) {
    return new NextResponse('Company not found', { status: 404 })
  }
  console.log('Company found:', company.name, 'email:', company.email)
console.log('Company found:', company.name, 'email:', company.email)
  if (action === 'approve') {
    await supabase
      .from('companies')
      .update({
        verification_status: 'verified',
        verified_at: new Date().toISOString(),
      })
      .eq('id', companyId)

    // Email the inspector
    try {
      await resend.emails.send({
        from: 'Domicert <reports@domicert.ca>',
        to: company.email || 'domicert@outlook.com',
      subject: 'Your Domicert account has been verified!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: #1D9E75; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 18px;">Account verified</h1>
          </div>
          <p>Hi ${company.name},</p>
          <p>Your Domicert account has been verified. You are now listed in the Domicert inspector directory and have full access to all features.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="display: inline-block; background: #1D9E75; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Go to your dashboard →
          </a>
          <p style="color: #9CA3AF; font-size: 12px; margin-top: 24px;">
            Domicert · Certified · Lasting · Trusted
          </p>
        </div>
      `,
    })
} catch (emailErr) {
      console.error('Email send error:', emailErr)
    }
    return new NextResponse(`
      <html><body style="font-family: sans-serif; padding: 40px; text-align: center;">
        <h1 style="color: #1D9E75;">✓ Inspector approved</h1>
        <p>${company.name} has been verified and will now appear in the directory.</p>
        <p>An email has been sent to ${company.email}.</p>
      </body></html>
    `, { headers: { 'Content-Type': 'text/html' } })

  } else if (action === 'reject') {
    await supabase
      .from('companies')
      .update({ verification_status: 'rejected' })
      .eq('id', companyId)

    await resend.emails.send({
      from: 'Domicert <reports@domicert.ca>',
      to: company.email,
      subject: 'Your Domicert account application',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <p>Hi ${company.name},</p>
          <p>Thank you for applying to join Domicert. Unfortunately we were unable to verify your license information at this time.</p>
          <p>If you believe this is an error, please contact us via the chat on our website or email support@domicert.ca.</p>
          <p style="color: #9CA3AF; font-size: 12px;">Domicert · Certified · Lasting · Trusted</p>
        </div>
      `,
    })

    return new NextResponse(`
      <html><body style="font-family: sans-serif; padding: 40px; text-align: center;">
        <h1 style="color: #DC2626;">✗ Inspector rejected</h1>
        <p>${company.name} has been rejected.</p>
        <p>An email has been sent to ${company.email}.</p>
      </body></html>
    `, { headers: { 'Content-Type': 'text/html' } })
  }

  return new NextResponse('Invalid action', { status: 400 })
}