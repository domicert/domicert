import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer'

const colors = {
  green: '#1D9E75',
  darkGreen: '#0F6E56',
  black: '#111827',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  border: '#E5E7EB',
  red: '#DC2626',
  yellow: '#D97706',
  white: '#FFFFFF',
  hazBg: '#1F2937',
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.black,
    backgroundColor: colors.white,
  },
  
  // Cover page
  cover: {
    backgroundColor: colors.green,
    padding: 48,
    minHeight: '100%',
    justifyContent: 'space-between',
  },
  coverTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 48,
  },
  coverLogoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coverCompanyName: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
  },
  coverCompanyDetails: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    marginTop: 2,
  },
  coverBadge: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    textAlign: 'right',
  },
  coverMain: {
    flex: 1,
    justifyContent: 'center',
  },
  coverLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  coverAddress: {
    color: colors.white,
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    lineHeight: 1.2,
  },
  coverCity: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    marginBottom: 32,
  },
  coverMeta: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 16,
  },
  coverMetaItem: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 9,
  },
  coverMetaLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 8,
    marginBottom: 2,
  },
  coverFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 16,
    marginTop: 32,
  },
  coverFooterText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 8,
  },
  // Page header
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 24,
  },
  pageHeaderLeft: {
    fontSize: 8,
    color: colors.gray,
  },
  pageHeaderRight: {
    fontSize: 8,
    color: colors.gray,
  },
  // Content
  content: {
    paddingHorizontal: 36,
    paddingBottom: 36,
  },
  // Section heading
  sectionHeading: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: colors.black,
    marginBottom: 12,
    marginTop: 20,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  // Executive summary boxes
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  summaryBox: {
    flex: 1,
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  summaryLabel: {
    fontSize: 8,
  },
  // Property overview grid
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  overviewItem: {
    width: '48%',
    flexDirection: 'row',
    gap: 4,
  },
  overviewLabel: {
    fontSize: 9,
    color: colors.gray,
    width: 80,
  },
  overviewValue: {
    fontSize: 9,
    color: colors.black,
    flex: 1,
  },
  // Finding rows
  findingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  findingBadge: {
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    minWidth: 28,
    textAlign: 'center',
  },
  findingLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.black,
  },
  findingSection: {
    fontSize: 8,
    color: colors.gray,
    marginTop: 2,
  },
  findingNotes: {
    fontSize: 8,
    color: colors.black,
    marginTop: 3,
    fontStyle: 'italic',
  },
  // Section block
  sectionBlock: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  sectionBlockHeader: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionBlockTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.black,
  },
  sectionBlockBody: {
    padding: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
 itemLabel: {
    fontSize: 9,
    color: colors.black,
  },
  itemNotes: {
    fontSize: 8,
    color: colors.gray,
    marginTop: 2,
    fontStyle: 'italic',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  footerLeft: {
    fontSize: 7,
    color: colors.gray,
  },
  footerRight: {
    fontSize: 7,
    color: colors.gray,
  },
  footerCenter: {
    fontSize: 7,
    color: colors.green,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  photoBlock: {
    width: '48%',
  },
  photoImage: {
    width: '100%',
    height: 140,
    borderRadius: 4,
  },
  photoCaption: {
    fontSize: 7,
    color: colors.gray,
    marginTop: 3,
    textAlign: 'center',
  },
})

interface ReportPhoto {
  src: string
  caption: string | null
}

interface ReportItem {
  id: string
  label: string
  rating: string | null
  notes: string
}

interface ReportSection {
  id: string
  label: string
  items: ReportItem[]
  notes: string
  photos: ReportPhoto[]
}

interface ReportData {
  property: {
    address: string
    city: string
    provinceState: string
    postalZip: string
    propertyType: string
    yearBuilt: string
    floors: number
    bedrooms: number
    fullBaths: number
    halfBaths: number
    basementType: string
  }
  client: {
    name: string
    email: string
  }
  inspector: {
    name: string
    companyName: string
    licenseNumber: string
    email: string
    phone: string
    logoSrc?: string
  }
  inspection: {
    date: string
    tier: string
    fee: string
  }
  sections: ReportSection[]
  counts: {
    haz: number
    def: number
    mon: number
    ok: number
  }
}

const ratingBadge = (rating: string | null) => {
  switch (rating) {
    case 'ok': return { bg: '#D1FAE5', color: '#065F46', text: 'OK' }
    case 'mon': return { bg: '#FEF3C7', color: '#92400E', text: 'MON' }
    case 'def': return { bg: '#FEE2E2', color: '#991B1B', text: 'DEF' }
    case 'haz': return { bg: colors.hazBg, color: colors.white, text: 'HAZ' }
    default: return { bg: colors.lightGray, color: colors.gray, text: 'N/A' }
  }
}

export function DomicertReport({ data }: { data: ReportData }) {
  const issues = data.sections.flatMap(s =>
    s.items.filter(i => i.rating === 'haz' || i.rating === 'def').map(i => ({ ...i, sectionLabel: s.label }))
  )
  const monitors = data.sections.flatMap(s =>
    s.items.filter(i => i.rating === 'mon').map(i => ({ ...i, sectionLabel: s.label }))
  )

  return (
    <Document>
      {/* COVER PAGE */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.cover}>
          <View style={styles.coverTop}>
            <View style={styles.coverLogoArea}>
              {data.inspector.logoSrc && (
                <Image
                  src={data.inspector.logoSrc}
                  style={{ width: 48, height: 48, borderRadius: 6, marginRight: 10 }}
                />
              )}
              <View>
                <Text style={styles.coverCompanyName}>{data.inspector.companyName}</Text>
                <Text style={styles.coverCompanyDetails}>
                  {data.inspector.name} · {data.inspector.licenseNumber}
                </Text>
                <Text style={styles.coverCompanyDetails}>
                  {data.inspector.phone} · {data.inspector.email}
                </Text>
              </View>
            </View>
            <View>
              <Text style={styles.coverBadge}>Powered by Domicert</Text>
              <Text style={styles.coverBadge}>domicert.ca</Text>
            </View>
          </View>

          <View style={styles.coverMain}>
            <Text style={styles.coverLabel}>Home Inspection Report</Text>
            <Text style={styles.coverAddress}>{data.property.address}</Text>
            <Text style={styles.coverCity}>
              {data.property.city}, {data.property.provinceState} {data.property.postalZip}
            </Text>

            <View style={styles.coverMeta}>
              <View>
                <Text style={styles.coverMetaLabel}>CLIENT</Text>
                <Text style={styles.coverMetaItem}>{data.client.name}</Text>
              </View>
              <View>
                <Text style={styles.coverMetaLabel}>INSPECTION DATE</Text>
                <Text style={styles.coverMetaItem}>{data.inspection.date}</Text>
              </View>
              <View>
                <Text style={styles.coverMetaLabel}>PROPERTY TYPE</Text>
                <Text style={styles.coverMetaItem}>{data.property.propertyType}</Text>
              </View>
              <View>
                <Text style={styles.coverMetaLabel}>YEAR BUILT</Text>
                <Text style={styles.coverMetaItem}>{data.property.yearBuilt || 'Unknown'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.coverFooter}>
            <Text style={styles.coverFooterText}>
              Certified · Lasting · Trusted
            </Text>
            <Text style={styles.coverFooterText}>
              This report reflects conditions at time of inspection only
            </Text>
          </View>
        </View>
      </Page>

      {/* EXECUTIVE SUMMARY PAGE */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageHeaderLeft}>
            {data.property.address}, {data.property.city}
          </Text>
          <Text style={styles.pageHeaderRight}>
            {data.inspector.companyName} · {data.inspection.date}
          </Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.sectionHeading}>Executive Summary</Text>

          <View style={styles.summaryRow}>
            <View style={[styles.summaryBox, { backgroundColor: colors.hazBg }]}>
              <Text style={[styles.summaryCount, { color: colors.white }]}>{data.counts.haz}</Text>
              <Text style={[styles.summaryLabel, { color: 'rgba(255,255,255,0.7)' }]}>Safety Hazards</Text>
            </View>
            <View style={[styles.summaryBox, { backgroundColor: '#FEE2E2' }]}>
              <Text style={[styles.summaryCount, { color: colors.red }]}>{data.counts.def}</Text>
              <Text style={[styles.summaryLabel, { color: '#991B1B' }]}>Defects</Text>
            </View>
            <View style={[styles.summaryBox, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.summaryCount, { color: '#92400E' }]}>{data.counts.mon}</Text>
              <Text style={[styles.summaryLabel, { color: '#92400E' }]}>Monitor</Text>
            </View>
            <View style={[styles.summaryBox, { backgroundColor: '#D1FAE5' }]}>
              <Text style={[styles.summaryCount, { color: '#065F46' }]}>{data.counts.ok}</Text>
              <Text style={[styles.summaryLabel, { color: '#065F46' }]}>Acceptable</Text>
            </View>
          </View>

          <Text style={styles.sectionHeading}>Property Overview</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Address:</Text>
              <Text style={styles.overviewValue}>{data.property.address}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Property type:</Text>
              <Text style={styles.overviewValue}>{data.property.propertyType}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Year built:</Text>
              <Text style={styles.overviewValue}>{data.property.yearBuilt || 'Unknown'}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Floors:</Text>
              <Text style={styles.overviewValue}>{data.property.floors}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Bedrooms:</Text>
              <Text style={styles.overviewValue}>{data.property.bedrooms}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Full bathrooms:</Text>
              <Text style={styles.overviewValue}>{data.property.fullBaths}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Half bathrooms:</Text>
              <Text style={styles.overviewValue}>{data.property.halfBaths}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Basement:</Text>
              <Text style={styles.overviewValue}>{data.property.basementType}</Text>
            </View>
          </View>

          {issues.length > 0 && (
            <>
              <Text style={styles.sectionHeading}>Items Requiring Attention</Text>
              {issues.map((item, idx) => {
                const badge = ratingBadge(item.rating)
                return (
                  <View key={idx} style={styles.findingRow}>
                    <View style={[styles.findingBadge, { backgroundColor: badge.bg }]}>
                      <Text style={{ color: badge.color, fontSize: 7, fontFamily: 'Helvetica-Bold' }}>
                        {badge.text}
                      </Text>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'column' }}>
  <Text style={styles.findingLabel}>{item.label}</Text>
  <Text style={styles.findingSection}>{item.sectionLabel}</Text>
  {item.notes && item.notes !== "See photo" && (
    <Text style={styles.findingNotes}>{item.notes}</Text>
  )}
</View>
                  </View>
                )
              })}
            </>
          )}

          {monitors.length > 0 && (
            <>
              <Text style={[styles.sectionHeading, { marginTop: 16 }]}>Items to Monitor</Text>
              {monitors.map((item, idx) => {
                const badge = ratingBadge(item.rating)
                return (
                  <View key={idx} style={styles.findingRow}>
                    <View style={[styles.findingBadge, { backgroundColor: badge.bg }]}>
                      <Text style={{ color: badge.color, fontSize: 7, fontFamily: 'Helvetica-Bold' }}>
                        {badge.text}
                      </Text>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'column' }}>
  <Text style={styles.findingLabel}>{item.label}</Text>
  <Text style={styles.findingSection}>{item.sectionLabel}</Text>
  {item.notes && item.notes !== "See photo" && (
    <Text style={styles.findingNotes}>{item.notes}</Text>
  )}
</View>
                  </View>
                )
              })}
            </>
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>{data.inspector.companyName} · {data.inspector.licenseNumber}</Text>
          <Text style={styles.footerCenter}>Domicert · domicert.ca</Text>
          <Text style={styles.footerRight} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>

      {/* DETAILED FINDINGS PAGES */}
      {data.sections.map(section => (
        <Page key={section.id} size="LETTER" style={styles.page}>
          <View style={styles.pageHeader}>
            <Text style={styles.pageHeaderLeft}>
              {data.property.address}, {data.property.city}
            </Text>
            <Text style={styles.pageHeaderRight}>
              {data.inspector.companyName} · {data.inspection.date}
            </Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.sectionHeading}>{section.label}</Text>
            <View style={styles.sectionBlock}>
              <View style={styles.sectionBlockBody}>
                {section.items.map((item, idx) => {
                  const badge = ratingBadge(item.rating)
                  return (
                    <View key={idx} style={styles.itemRow}>
                      <View style={[styles.findingBadge, { backgroundColor: badge.bg }]}>
                        <Text style={{ color: badge.color, fontSize: 7, fontFamily: 'Helvetica-Bold' }}>
                          {badge.text}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemLabel}>{item.label}</Text>
                        {item.notes && item.notes !== "See photo" && (
                          <Text style={styles.itemNotes}>{item.notes}</Text>
                        )}
                      </View>
                    </View>
                  )
                })}
                {section.notes ? (
                  <View style={{ marginTop: 10, padding: 8, backgroundColor: colors.lightGray, borderRadius: 4 }}>
                    <Text style={{ fontSize: 8, color: colors.gray, marginBottom: 3, fontFamily: 'Helvetica-Bold' }}>
                      Inspector notes:
                    </Text>
                    <Text style={{ fontSize: 9, color: colors.black }}>{section.notes}</Text>
                  </View>
                ) : null}
                {section.photos && section.photos.length > 0 && (
                  <View style={styles.photoGrid}>
                    {section.photos.map((photo, idx) => (
                      <View key={idx} style={styles.photoBlock}>
                        <Image src={photo.src} style={styles.photoImage} />
                        {photo.caption && (
                          <Text style={styles.photoCaption}>{photo.caption}</Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={styles.footer} fixed>
            <Text style={styles.footerLeft}>{data.inspector.companyName} · {data.inspector.licenseNumber}</Text>
            <Text style={styles.footerCenter}>Domicert · domicert.ca</Text>
            <Text style={styles.footerRight} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
          </View>
        </Page>
      ))}

      {/* DISCLAIMER PAGE */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageHeaderLeft}>
            {data.property.address}, {data.property.city}
          </Text>
          <Text style={styles.pageHeaderRight}>
            {data.inspector.companyName} · {data.inspection.date}
          </Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.sectionHeading}>Limitations & Disclaimer</Text>
          <Text style={{ fontSize: 9, color: colors.black, lineHeight: 1.6, marginBottom: 12 }}>
            This inspection report is intended to provide the client with information regarding the condition
            of the inspected property at the time of the inspection only. The inspection is visual in nature
            and is not technically exhaustive. The inspector did not dismantle, move, or disturb any
            personal property, furniture, equipment, or other items during the inspection.
          </Text>
          <Text style={{ fontSize: 9, color: colors.black, lineHeight: 1.6, marginBottom: 12 }}>
            This report does not constitute a warranty, guarantee, or insurance policy of any kind.
            The inspector is not liable for the cost of repairing or replacing any unreported defects
            or conditions, either current or arising in the future.
          </Text>
          <Text style={{ fontSize: 9, color: colors.black, lineHeight: 1.6, marginBottom: 24 }}>
            This report was prepared for the exclusive use of the client named on the cover page.
            Any use of this report by third parties is done so at their own risk.
          </Text>

          <Text style={styles.sectionHeading}>Rating Legend</Text>
          {[
            { rating: 'ok', desc: 'Acceptable — condition is satisfactory, no action required at this time.' },
            { rating: 'mon', desc: 'Monitor — condition should be monitored and addressed within 12 months.' },
            { rating: 'def', desc: 'Defect — repair or replacement is recommended. Contact an appropriate contractor.' },
            { rating: 'haz', desc: 'Safety Hazard — immediate attention required. Do not delay action on these items.' },
          ].map(({ rating, desc }) => {
            const badge = ratingBadge(rating)
            return (
              <View key={rating} style={[styles.findingRow, { alignItems: 'center' }]}>
                <View style={[styles.findingBadge, { backgroundColor: badge.bg }]}>
                  <Text style={{ color: badge.color, fontSize: 7, fontFamily: 'Helvetica-Bold' }}>
                    {badge.text}
                  </Text>
                </View>
                <Text style={{ fontSize: 9, color: colors.black, flex: 1 }}>{desc}</Text>
              </View>
            )
          })}

          <View style={{ marginTop: 32, padding: 16, backgroundColor: colors.lightGray, borderRadius: 6 }}>
            <Text style={{ fontSize: 9, color: colors.gray, textAlign: 'center' }}>
              Inspector: {data.inspector.name} · {data.inspector.licenseNumber}
            </Text>
            <Text style={{ fontSize: 9, color: colors.gray, textAlign: 'center', marginTop: 4 }}>
              {data.inspector.companyName} · {data.inspector.email} · {data.inspector.phone}
            </Text>
            <Text style={{ fontSize: 8, color: colors.gray, textAlign: 'center', marginTop: 8 }}>
              Report generated by Domicert · domicert.ca · Certified · Lasting · Trusted
            </Text>
          </View>
        </View>
        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>{data.inspector.companyName} · {data.inspector.licenseNumber}</Text>
          <Text style={styles.footerCenter}>Domicert · domicert.ca</Text>
          <Text style={styles.footerRight} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}