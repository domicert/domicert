export interface RegulatoryInfo {
  region: string
  code: string
  country: 'CA' | 'US'
  licenseRequired: boolean
  regulatorName: string | null
  regulatorUrl: string | null
  licenseLabel: string
  notes: string
}

export const REGULATORY_DATA: Record<string, RegulatoryInfo> = {
  // CANADA
  ON: {
    region: 'Ontario', code: 'ON', country: 'CA',
    licenseRequired: true,
    regulatorName: 'Home Construction Regulatory Authority (HCRA)',
    regulatorUrl: 'https://www.hcraontario.ca/licensing',
    licenseLabel: 'HCRA License number (required)',
    notes: 'Verify at hcraontario.ca/licensing',
  },
  BC: {
    region: 'British Columbia', code: 'BC', country: 'CA',
    licenseRequired: true,
    regulatorName: 'Consumer Protection BC (CPBC)',
    regulatorUrl: 'https://www.consumerprotectionbc.ca/get-keep-licence/home-inspections',
    licenseLabel: 'CPBC License number (required)',
    notes: 'Verify at consumerprotectionbc.ca',
  },
  AB: {
    region: 'Alberta', code: 'AB', country: 'CA',
    licenseRequired: true,
    regulatorName: 'Service Alberta',
    regulatorUrl: 'https://www.servicealberta.gov.ab.ca/home-inspectors.cfm',
    licenseLabel: 'Service Alberta License number (required)',
    notes: 'Verify at servicealberta.gov.ab.ca',
  },
  MB: {
    region: 'Manitoba', code: 'MB', country: 'CA',
    licenseRequired: false,
    regulatorName: null,
    regulatorUrl: null,
    licenseLabel: 'License or certification number (optional)',
    notes: 'No mandatory licensing in Manitoba. Manual review of business details.',
  },
  SK: {
    region: 'Saskatchewan', code: 'SK', country: 'CA',
    licenseRequired: false,
    regulatorName: null,
    regulatorUrl: null,
    licenseLabel: 'License or certification number (optional)',
    notes: 'No mandatory licensing in Saskatchewan. Manual review of business details.',
  },
  NB: {
    region: 'New Brunswick', code: 'NB', country: 'CA',
    licenseRequired: false,
    regulatorName: null,
    regulatorUrl: null,
    licenseLabel: 'License or certification number (optional)',
    notes: 'No mandatory licensing in New Brunswick. Manual review of business details.',
  },
  NS: {
    region: 'Nova Scotia', code: 'NS', country: 'CA',
    licenseRequired: false,
    regulatorName: null,
    regulatorUrl: null,
    licenseLabel: 'License or certification number (optional)',
    notes: 'No mandatory licensing in Nova Scotia. Manual review of business details.',
  },
  NL: {
    region: 'Newfoundland', code: 'NL', country: 'CA',
    licenseRequired: false,
    regulatorName: null,
    regulatorUrl: null,
    licenseLabel: 'License or certification number (optional)',
    notes: 'No mandatory licensing in Newfoundland. Manual review of business details.',
  },
  PE: {
    region: 'PEI', code: 'PE', country: 'CA',
    licenseRequired: false,
    regulatorName: null,
    regulatorUrl: null,
    licenseLabel: 'License or certification number (optional)',
    notes: 'No mandatory licensing in PEI. Manual review of business details.',
  },
  QC: {
    region: 'Quebec', code: 'QC', country: 'CA',
    licenseRequired: false,
    regulatorName: null,
    regulatorUrl: null,
    licenseLabel: 'License or certification number (optional)',
    notes: 'No mandatory licensing in Quebec. Manual review of business details.',
  },

  // USA — Licensed states
  AL: { region: 'Alabama', code: 'AL', country: 'US', licenseRequired: true, regulatorName: 'Alabama Division of Construction Management', regulatorUrl: 'https://www.dcm.alabama.gov', licenseLabel: 'State license number (required)', notes: 'Verify at dcm.alabama.gov' },
  AK: { region: 'Alaska', code: 'AK', country: 'US', licenseRequired: true, regulatorName: 'Alaska Dept of Commerce', regulatorUrl: 'https://www.commerce.alaska.gov/web/cbpl/ProfessionalLicensing', licenseLabel: 'State license number (required)', notes: 'Verify at commerce.alaska.gov' },
  AZ: { region: 'Arizona', code: 'AZ', country: 'US', licenseRequired: true, regulatorName: 'Arizona State Board of Technical Registration', regulatorUrl: 'https://www.azbtimestamp.gov', licenseLabel: 'State license number (required)', notes: 'Verify at azbtimestamp.gov' },
  AR: { region: 'Arkansas', code: 'AR', country: 'US', licenseRequired: true, regulatorName: 'Arkansas Home Inspector Registration Board', regulatorUrl: 'https://www.arkansas.gov/homeinspector', licenseLabel: 'State license number (required)', notes: 'Verify at arkansas.gov/homeinspector' },
  CT: { region: 'Connecticut', code: 'CT', country: 'US', licenseRequired: true, regulatorName: 'Connecticut Department of Consumer Protection', regulatorUrl: 'https://portal.ct.gov/DCP', licenseLabel: 'State license number (required)', notes: 'Verify at portal.ct.gov/DCP' },
  DE: { region: 'Delaware', code: 'DE', country: 'US', licenseRequired: true, regulatorName: 'Delaware Division of Professional Regulation', regulatorUrl: 'https://dpr.delaware.gov', licenseLabel: 'State license number (required)', notes: 'Verify at dpr.delaware.gov' },
  FL: { region: 'Florida', code: 'FL', country: 'US', licenseRequired: true, regulatorName: 'Florida DBPR', regulatorUrl: 'https://www.myfloridalicense.com', licenseLabel: 'State license number (required)', notes: 'Verify at myfloridalicense.com' },
  GA: { region: 'Georgia', code: 'GA', country: 'US', licenseRequired: true, regulatorName: 'Georgia Secretary of State', regulatorUrl: 'https://sos.georgia.gov', licenseLabel: 'State license number (required)', notes: 'Verify at sos.georgia.gov' },
  HI: { region: 'Hawaii', code: 'HI', country: 'US', licenseRequired: true, regulatorName: 'Hawaii DCCA', regulatorUrl: 'https://cca.hawaii.gov', licenseLabel: 'State license number (required)', notes: 'Verify at cca.hawaii.gov' },
  IL: { region: 'Illinois', code: 'IL', country: 'US', licenseRequired: true, regulatorName: 'Illinois IDFPR', regulatorUrl: 'https://idfpr.illinois.gov', licenseLabel: 'State license number (required)', notes: 'Verify at idfpr.illinois.gov' },
  IN: { region: 'Indiana', code: 'IN', country: 'US', licenseRequired: true, regulatorName: 'Indiana Professional Licensing Agency', regulatorUrl: 'https://www.in.gov/pla', licenseLabel: 'State license number (required)', notes: 'Verify at in.gov/pla' },
  IA: { region: 'Iowa', code: 'IA', country: 'US', licenseRequired: true, regulatorName: 'Iowa Division of Labor', regulatorUrl: 'https://www.iowadivisionoflabor.gov', licenseLabel: 'State license number (required)', notes: 'Verify at iowadivisionoflabor.gov' },
  KS: { region: 'Kansas', code: 'KS', country: 'US', licenseRequired: true, regulatorName: 'Kansas Office of the State Fire Marshal', regulatorUrl: 'https://firemarshal.ks.gov', licenseLabel: 'State license number (required)', notes: 'Verify at firemarshal.ks.gov' },
  KY: { region: 'Kentucky', code: 'KY', country: 'US', licenseRequired: true, regulatorName: 'Kentucky Dept of Housing', regulatorUrl: 'https://dhbc.ky.gov', licenseLabel: 'State license number (required)', notes: 'Verify at dhbc.ky.gov' },
  LA: { region: 'Louisiana', code: 'LA', country: 'US', licenseRequired: true, regulatorName: 'Louisiana State Board of Home Inspectors', regulatorUrl: 'https://lsbhi.louisiana.gov', licenseLabel: 'State license number (required)', notes: 'Verify at lsbhi.louisiana.gov' },
  ME: { region: 'Maine', code: 'ME', country: 'US', licenseRequired: true, regulatorName: 'Maine Office of Professional & Occupational Regulation', regulatorUrl: 'https://www.maine.gov/pfr/professionallicensing', licenseLabel: 'State license number (required)', notes: 'Verify at maine.gov/pfr' },
  MD: { region: 'Maryland', code: 'MD', country: 'US', licenseRequired: true, regulatorName: 'Maryland DLLR', regulatorUrl: 'https://www.dllr.state.md.us', licenseLabel: 'State license number (required)', notes: 'Verify at dllr.state.md.us' },
  MA: { region: 'Massachusetts', code: 'MA', country: 'US', licenseRequired: true, regulatorName: 'Massachusetts Office of Consumer Affairs', regulatorUrl: 'https://www.mass.gov/orgs/division-of-professional-licensure', licenseLabel: 'State license number (required)', notes: 'Verify at mass.gov/dpl' },
  MS: { region: 'Mississippi', code: 'MS', country: 'US', licenseRequired: true, regulatorName: 'Mississippi State Board of Home Inspectors', regulatorUrl: 'https://msbhi.ms.gov', licenseLabel: 'State license number (required)', notes: 'Verify at msbhi.ms.gov' },
  MO: { region: 'Missouri', code: 'MO', country: 'US', licenseRequired: true, regulatorName: 'Missouri Division of Professional Registration', regulatorUrl: 'https://pr.mo.gov', licenseLabel: 'State license number (required)', notes: 'Verify at pr.mo.gov' },
  NV: { region: 'Nevada', code: 'NV', country: 'US', licenseRequired: true, regulatorName: 'Nevada Real Estate Division', regulatorUrl: 'https://red.nv.gov', licenseLabel: 'State license number (required)', notes: 'Verify at red.nv.gov' },
  NH: { region: 'New Hampshire', code: 'NH', country: 'US', licenseRequired: true, regulatorName: 'NH Office of Professional Licensure', regulatorUrl: 'https://www.oplc.nh.gov', licenseLabel: 'State license number (required)', notes: 'Verify at oplc.nh.gov' },
  NJ: { region: 'New Jersey', code: 'NJ', country: 'US', licenseRequired: true, regulatorName: 'NJ Division of Consumer Affairs', regulatorUrl: 'https://www.njconsumeraffairs.gov', licenseLabel: 'State license number (required)', notes: 'Verify at njconsumeraffairs.gov' },
  NM: { region: 'New Mexico', code: 'NM', country: 'US', licenseRequired: true, regulatorName: 'NM Regulation & Licensing Dept', regulatorUrl: 'https://www.rld.nm.gov', licenseLabel: 'State license number (required)', notes: 'Verify at rld.nm.gov' },
  NY: { region: 'New York', code: 'NY', country: 'US', licenseRequired: true, regulatorName: 'NY Department of State', regulatorUrl: 'https://www.dos.ny.gov/licensing', licenseLabel: 'State license number (required)', notes: 'Verify at dos.ny.gov/licensing' },
  NC: { region: 'North Carolina', code: 'NC', country: 'US', licenseRequired: true, regulatorName: 'NC Home Inspector Licensure Board', regulatorUrl: 'https://www.nchilb.org', licenseLabel: 'State license number (required)', notes: 'Verify at nchilb.org' },
  ND: { region: 'North Dakota', code: 'ND', country: 'US', licenseRequired: true, regulatorName: 'ND Secretary of State', regulatorUrl: 'https://sos.nd.gov', licenseLabel: 'State license number (required)', notes: 'Verify at sos.nd.gov' },
  OH: { region: 'Ohio', code: 'OH', country: 'US', licenseRequired: true, regulatorName: 'Ohio Division of Real Estate', regulatorUrl: 'https://com.ohio.gov/real-estate', licenseLabel: 'State license number (required)', notes: 'Verify at com.ohio.gov' },
  OK: { region: 'Oklahoma', code: 'OK', country: 'US', licenseRequired: true, regulatorName: 'Oklahoma Construction Industries Board', regulatorUrl: 'https://cib.ok.gov', licenseLabel: 'State license number (required)', notes: 'Verify at cib.ok.gov' },
  OR: { region: 'Oregon', code: 'OR', country: 'US', licenseRequired: true, regulatorName: 'Oregon CCB', regulatorUrl: 'https://www.oregon.gov/ccb', licenseLabel: 'State license number (required)', notes: 'Verify at oregon.gov/ccb' },
  RI: { region: 'Rhode Island', code: 'RI', country: 'US', licenseRequired: true, regulatorName: 'RI Dept of Business Regulation', regulatorUrl: 'https://dbr.ri.gov', licenseLabel: 'State license number (required)', notes: 'Verify at dbr.ri.gov' },
  SC: { region: 'South Carolina', code: 'SC', country: 'US', licenseRequired: true, regulatorName: 'SC Dept of Labor, Licensing and Regulation', regulatorUrl: 'https://llr.sc.gov', licenseLabel: 'State license number (required)', notes: 'Verify at llr.sc.gov' },
  SD: { region: 'South Dakota', code: 'SD', country: 'US', licenseRequired: true, regulatorName: 'SD Dept of Labor & Regulation', regulatorUrl: 'https://dlr.sd.gov', licenseLabel: 'State license number (required)', notes: 'Verify at dlr.sd.gov' },
  TN: { region: 'Tennessee', code: 'TN', country: 'US', licenseRequired: true, regulatorName: 'Tennessee Dept of Commerce & Insurance', regulatorUrl: 'https://www.tn.gov/commerce', licenseLabel: 'State license number (required)', notes: 'Verify at tn.gov/commerce' },
  TX: { region: 'Texas', code: 'TX', country: 'US', licenseRequired: true, regulatorName: 'Texas Real Estate Commission (TREC)', regulatorUrl: 'https://www.trec.texas.gov', licenseLabel: 'State license number (required)', notes: 'Verify at trec.texas.gov' },
  UT: { region: 'Utah', code: 'UT', country: 'US', licenseRequired: true, regulatorName: 'Utah Division of Real Estate', regulatorUrl: 'https://realestate.utah.gov', licenseLabel: 'State license number (required)', notes: 'Verify at realestate.utah.gov' },
  VT: { region: 'Vermont', code: 'VT', country: 'US', licenseRequired: true, regulatorName: 'Vermont Office of Professional Regulation', regulatorUrl: 'https://sos.vermont.gov/opr', licenseLabel: 'State license number (required)', notes: 'Verify at sos.vermont.gov/opr' },
  VA: { region: 'Virginia', code: 'VA', country: 'US', licenseRequired: true, regulatorName: 'Virginia DPOR', regulatorUrl: 'https://www.dpor.virginia.gov', licenseLabel: 'State license number (required)', notes: 'Verify at dpor.virginia.gov' },
  WA: { region: 'Washington', code: 'WA', country: 'US', licenseRequired: true, regulatorName: 'Washington Dept of Licensing', regulatorUrl: 'https://www.dol.wa.gov', licenseLabel: 'State license number (required)', notes: 'Verify at dol.wa.gov' },
  WV: { region: 'West Virginia', code: 'WV', country: 'US', licenseRequired: true, regulatorName: 'WV Division of Labor', regulatorUrl: 'https://labor.wv.gov', licenseLabel: 'State license number (required)', notes: 'Verify at labor.wv.gov' },
  WI: { region: 'Wisconsin', code: 'WI', country: 'US', licenseRequired: true, regulatorName: 'Wisconsin DSPS', regulatorUrl: 'https://dsps.wi.gov', licenseLabel: 'State license number (required)', notes: 'Verify at dsps.wi.gov' },

  // USA — No license required
  CA: { region: 'California', code: 'CA', country: 'US', licenseRequired: false, regulatorName: null, regulatorUrl: null, licenseLabel: 'License or certification number (optional)', notes: 'No mandatory licensing in California. Manual review of business details.' },
  CO: { region: 'Colorado', code: 'CO', country: 'US', licenseRequired: false, regulatorName: null, regulatorUrl: null, licenseLabel: 'License or certification number (optional)', notes: 'No mandatory licensing in Colorado. Manual review of business details.' },
  ID: { region: 'Idaho', code: 'ID', country: 'US', licenseRequired: false, regulatorName: null, regulatorUrl: null, licenseLabel: 'License or certification number (optional)', notes: 'No mandatory licensing in Idaho. Manual review of business details.' },
  MI: { region: 'Michigan', code: 'MI', country: 'US', licenseRequired: false, regulatorName: null, regulatorUrl: null, licenseLabel: 'License or certification number (optional)', notes: 'No mandatory licensing in Michigan. Manual review of business details.' },
  MN: { region: 'Minnesota', code: 'MN', country: 'US', licenseRequired: false, regulatorName: null, regulatorUrl: null, licenseLabel: 'License or certification number (optional)', notes: 'No mandatory licensing in Minnesota. Manual review of business details.' },
  MT: { region: 'Montana', code: 'MT', country: 'US', licenseRequired: false, regulatorName: null, regulatorUrl: null, licenseLabel: 'License or certification number (optional)', notes: 'No mandatory licensing in Montana. Manual review of business details.' },
  PA: { region: 'Pennsylvania', code: 'PA', country: 'US', licenseRequired: false, regulatorName: null, regulatorUrl: null, licenseLabel: 'License or certification number (optional)', notes: 'No mandatory licensing in Pennsylvania. Manual review of business details.' },
  WY: { region: 'Wyoming', code: 'WY', country: 'US', licenseRequired: false, regulatorName: null, regulatorUrl: null, licenseLabel: 'License or certification number (optional)', notes: 'No mandatory licensing in Wyoming. Manual review of business details.' },
}

export function getRegulatoryInfo(provinceState: string): RegulatoryInfo | null {
  return REGULATORY_DATA[provinceState] || null
}