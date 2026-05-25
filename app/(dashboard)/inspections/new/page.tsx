'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type Tier = 'text' | 'basic' | 'pro' | 'pro_plus' | 'unlimited'

const TIERS = [
  { id: 'text', label: 'Text only', photos: 0, fee: 0, desc: 'No photos — text findings only' },
  { id: 'basic', label: 'Basic', photos: 5, fee: 0, desc: 'Up to 5 photos' },
  { id: 'pro', label: 'Pro', photos: 15, fee: 0, desc: 'Up to 15 photos' },
  { id: 'pro_plus', label: 'Pro+', photos: 30, fee: 0, desc: 'Up to 30 photos' },
  { id: 'unlimited', label: 'Unlimited', photos: null, fee: 0, desc: '31+ photos' },
]

type Rating = 'ok' | 'mon' | 'def' | 'haz' | null

interface ChecklistItem {
  id: string
  label: string
  hint: string
  rating: Rating
  notes: string
}

interface Section {
  id: string
  type: string
  label: string
  items: ChecklistItem[]
  notes: string
  enabled: boolean
}

const CHECKLIST: Record<string, ChecklistItem[]> = {
  exterior: [
    { id: 'e1', label: 'Siding condition', hint: 'Check for cracks, rot, missing panels, moisture damage', rating: null, notes: '' },
    { id: 'e2', label: 'Windows & doors (exterior)', hint: 'Seals, caulking, operation, weather stripping', rating: null, notes: '' },
    { id: 'e3', label: 'Walkways & driveway', hint: 'Cracks, heaving, drainage slope', rating: null, notes: '' },
    { id: 'e4', label: 'Grading & drainage', hint: 'Ground slopes away from foundation at least 6ft', rating: null, notes: '' },
    { id: 'e5', label: 'Soffit & fascia', hint: 'Rot, damage, pest entry points', rating: null, notes: '' },
    { id: 'e6', label: 'Eavestroughs & downspouts', hint: 'Secure, clear, directed away from foundation', rating: null, notes: '' },
  ],
  roof: [
    { id: 'r1', label: 'Shingle condition', hint: 'Missing, cracked, curling, granule loss', rating: null, notes: '' },
    { id: 'r2', label: 'Flashing', hint: 'Around chimney, vents, valleys — check for gaps', rating: null, notes: '' },
    { id: 'r3', label: 'Gutters', hint: 'Secure, clear, properly sloped', rating: null, notes: '' },
    { id: 'r4', label: 'Chimney condition', hint: 'Mortar, cap, flashing, crown', rating: null, notes: '' },
    { id: 'r5', label: 'Roof penetrations', hint: 'Vents, pipes, skylights — properly sealed', rating: null, notes: '' },
  ],
  foundation: [
    { id: 'f1', label: 'Foundation walls', hint: 'Cracks, bowing, moisture staining', rating: null, notes: '' },
    { id: 'f2', label: 'Floor structure', hint: 'Sagging, damage, pest activity', rating: null, notes: '' },
    { id: 'f3', label: 'Sill plates', hint: 'Rot, insect damage, moisture', rating: null, notes: '' },
    { id: 'f4', label: 'Beam & column condition', hint: 'Proper support, no damage', rating: null, notes: '' },
  ],
  electrical: [
    { id: 'el1', label: 'Main panel condition', hint: 'Breaker type, capacity, labeling, double-tapping', rating: null, notes: '' },
    { id: 'el2', label: 'Wiring type & condition', hint: 'Aluminum, knob & tube, copper — check for damage', rating: null, notes: '' },
    { id: 'el3', label: 'Outlets & switches', hint: 'GFCI where required, grounding, covers', rating: null, notes: '' },
    { id: 'el4', label: 'Smoke & CO detectors', hint: 'Present, functional, properly located', rating: null, notes: '' },
    { id: 'el5', label: 'Exterior electrical', hint: 'Weatherproof covers, condition of service entry', rating: null, notes: '' },
  ],
  plumbing: [
    { id: 'p1', label: 'Supply pipes', hint: 'Material, condition, pressure, shutoffs', rating: null, notes: '' },
    { id: 'p2', label: 'Drain, waste & vent', hint: 'Material, condition, proper slope', rating: null, notes: '' },
    { id: 'p3', label: 'Water heater', hint: 'Age, condition, TPR valve, venting', rating: null, notes: '' },
    { id: 'p4', label: 'Fixtures', hint: 'Leaks, operation, caulking around tubs/showers', rating: null, notes: '' },
    { id: 'p5', label: 'Sump pump', hint: 'Present, operational, discharge location', rating: null, notes: '' },
  ],
  hvac: [
    { id: 'h1', label: 'Furnace / heating system', hint: 'Age, condition, filter, heat exchanger', rating: null, notes: '' },
    { id: 'h2', label: 'Air conditioning', hint: 'Age, condition, refrigerant lines, clearances', rating: null, notes: '' },
    { id: 'h3', label: 'Ductwork', hint: 'Condition, insulation, connections', rating: null, notes: '' },
    { id: 'h4', label: 'Ventilation', hint: 'Bathroom fans, kitchen exhaust, HRV', rating: null, notes: '' },
    { id: 'h5', label: 'Fireplace / wood stove', hint: 'Damper, firebox, flue, clearances', rating: null, notes: '' },
  ],
  kitchen: [
    { id: 'k1', label: 'Cabinets & countertops', hint: 'Condition, operation, damage', rating: null, notes: '' },
    { id: 'k2', label: 'Sink & faucet', hint: 'Leaks, drainage, supply shutoffs', rating: null, notes: '' },
    { id: 'k3', label: 'Appliances', hint: 'Stove, dishwasher, hood fan — operation', rating: null, notes: '' },
    { id: 'k4', label: 'Flooring', hint: 'Condition, type, damage', rating: null, notes: '' },
    { id: 'k5', label: 'GFCI outlets', hint: 'Present and functional near sink', rating: null, notes: '' },
  ],
  basement: [
    { id: 'b1', label: 'Moisture & water intrusion', hint: 'Staining, efflorescence, active leaks', rating: null, notes: '' },
    { id: 'b2', label: 'Insulation', hint: 'Type, coverage, condition', rating: null, notes: '' },
    { id: 'b3', label: 'Finished areas', hint: 'Walls, ceiling, flooring condition', rating: null, notes: '' },
    { id: 'b4', label: 'Egress windows', hint: 'Present where required, operational', rating: null, notes: '' },
  ],
  attic: [
    { id: 'a1', label: 'Insulation', hint: 'Type, depth, coverage', rating: null, notes: '' },
    { id: 'a2', label: 'Ventilation', hint: 'Soffit vents, ridge vent, adequate airflow', rating: null, notes: '' },
    { id: 'a3', label: 'Sheathing condition', hint: 'Staining, mold, damage', rating: null, notes: '' },
    { id: 'a4', label: 'Structural members', hint: 'Rafters, trusses — condition and integrity', rating: null, notes: '' },
  ],
  garage: [
    { id: 'g1', label: 'Structure & condition', hint: 'Walls, ceiling, floor — cracks, damage', rating: null, notes: '' },
    { id: 'g2', label: 'Garage door', hint: 'Operation, auto-reverse, safety sensors', rating: null, notes: '' },
    { id: 'g3', label: 'Fire separation', hint: 'Door to house — self-closing, fire rated', rating: null, notes: '' },
    { id: 'g4', label: 'Electrical in garage', hint: 'Outlets, lighting, GFCI', rating: null, notes: '' },
  ],
  bathroom: [
    { id: 'ba1', label: 'Toilet', hint: 'Flush operation, leaks, secure to floor', rating: null, notes: '' },
    { id: 'ba2', label: 'Sink & faucet', hint: 'Leaks, drainage, caulking condition', rating: null, notes: '' },
    { id: 'ba3', label: 'Shower / tub', hint: 'Caulking, grout, drain, operation', rating: null, notes: '' },
    { id: 'ba4', label: 'Exhaust fan', hint: 'Operational, vented to exterior', rating: null, notes: '' },
    { id: 'ba5', label: 'GFCI outlet', hint: 'Present and functional near water', rating: null, notes: '' },
    { id: 'ba6', label: 'Flooring & walls', hint: 'Condition, water damage, tile integrity', rating: null, notes: '' },
  ],
  half_bath: [
    { id: 'hb1', label: 'Toilet', hint: 'Flush operation, leaks, secure to floor', rating: null, notes: '' },
    { id: 'hb2', label: 'Sink & faucet', hint: 'Leaks, drainage, caulking condition', rating: null, notes: '' },
    { id: 'hb3', label: 'GFCI outlet', hint: 'Present and functional near water', rating: null, notes: '' },
    { id: 'hb4', label: 'Flooring & walls', hint: 'Condition, water damage', rating: null, notes: '' },
  ],
}
export default function NewInspectionPage() {
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [selectedTier, setSelectedTier] = useState<Tier>('pro')
  const [expandedSection, setExpandedSection] = useState<string | null>('exterior')

  const [property, setProperty] = useState({
    address: '', city: '', provinceState: 'ON', postalZip: '',
    country: 'CA', yearBuilt: '', propertyType: 'single_family',
    clientName: '', clientEmail: '', clientPhone: '',
    inspectionFee: '', inspectionDate: '',
  })

  const [config, setConfig] = useState({
    floors: 2, bedrooms: 3, fullBaths: 2, halfBaths: 0,
    basementType: 'none' as 'none' | 'unfinished' | 'partial' | 'finished',
    hasGarage: false, hasAttic: false, hasCrawlspace: false,
    hasPool: false, hasDeck: false,
    deckType: 'wood' as 'wood' | 'composite' | 'stone' | 'concrete' | 'interlock',
    hasFence: false,
    drivewayType: 'asphalt' as 'asphalt' | 'concrete' | 'interlock' | 'gravel' | 'paver' | 'mixed',
    roofType: 'asphalt_shingle' as 'asphalt_shingle' | 'metal' | 'flat' | 'cedar_shake' | 'slate' | 'tile',
    hasCentralAc: false, hasForcedAir: false,
    hasWoodFireplace: false, hasGasFireplace: false, hasSumpPump: false,
  })

  const buildSections = (): Section[] => {
    const sections: Section[] = [
      { id: 'exterior', type: 'exterior', label: 'Exterior', enabled: true, notes: '', items: CHECKLIST.exterior.map(i => ({
      ...i,
      label: i.id === 'e3' ? 'Walkways' : i.label,
      hint: i.id === 'e3' ? 'Cracks, heaving, drainage slope — excludes driveway' : i.hint,
    })) },
      { id: 'foundation', type: 'foundation', label: 'Foundation & structure', enabled: true, notes: '', items: CHECKLIST.foundation.map(i => ({ ...i })) },
     { id: 'roof', type: 'roof', label: 'Roof', enabled: true, notes: '', items: (() => {
        const base = [
          { id: 'r1', label: 'Surface condition', hint: '', rating: null as Rating, notes: '' },
          { id: 'r2', label: 'Flashing', hint: 'Around vents, valleys, penetrations — check for gaps', rating: null as Rating, notes: '' },
          { id: 'r3', label: 'Gutters & downspouts', hint: 'Secure, clear, properly sloped', rating: null as Rating, notes: '' },
          { id: 'r4', label: 'Roof penetrations', hint: 'Vents, pipes, skylights — properly sealed', rating: null as Rating, notes: '' },
        ]
        const surfaceHints: Record<string, string> = {
          asphalt_shingle: 'Missing, cracked, curling, granule loss',
          metal: 'Rust, fastener condition, seam integrity, oil canning',
          flat: 'Membrane condition, blistering, ponding water, seams',
          cedar_shake: 'Split, missing, rot, moss/lichen growth',
          slate: 'Cracked, missing, slipped slates, flashing condition',
          tile: 'Cracked, broken, or missing tiles, mortar condition',
        }
        base[0].hint = surfaceHints[config.roofType]
        base[0].label = {
          asphalt_shingle: 'Shingle condition',
          metal: 'Metal panel condition',
          flat: 'Membrane condition',
          cedar_shake: 'Cedar shake condition',
          slate: 'Slate condition',
          tile: 'Tile condition',
        }[config.roofType]
        if (config.hasWoodFireplace) {
          base.splice(2, 0, { id: 'r_chimney', label: 'Chimney condition', hint: 'Mortar, cap, flashing, crown, liner', rating: null as Rating, notes: '' })
        }
        return base
      })() },
      { id: 'electrical', type: 'electrical', label: 'Electrical', enabled: true, notes: '', items: CHECKLIST.electrical.map(i => ({ ...i })) },
      { id: 'plumbing', type: 'plumbing', label: 'Plumbing', enabled: true, notes: '', items: CHECKLIST.plumbing.map(i => ({ ...i })).filter(i => {
        if (i.id === 'p5' && !config.hasSumpPump) return false
        return true
      })},
    ]
const drivewayLabel = {
      asphalt: 'Driveway — asphalt',
      concrete: 'Driveway — concrete',
      interlock: 'Driveway — interlock',
      gravel: 'Driveway — gravel',
      paver: 'Driveway — paver stones',
      mixed: 'Driveway — mixed materials',
    }[config.drivewayType]

    const drivewayItems = {
      asphalt: [
        { id: 'drv1', label: 'Surface condition', hint: 'Cracks, potholes, alligatoring, oxidation', rating: null as Rating, notes: '' },
        { id: 'drv2', label: 'Drainage & slope', hint: 'Proper slope away from garage and house', rating: null as Rating, notes: '' },
        { id: 'drv3', label: 'Edges & borders', hint: 'Crumbling edges, separation from lawn', rating: null as Rating, notes: '' },
        { id: 'drv4', label: 'Seal coat condition', hint: 'Worn, missing, or recently applied', rating: null as Rating, notes: '' },
      ],
      concrete: [
        { id: 'drv1', label: 'Surface condition', hint: 'Cracks, spalling, scaling, settlement', rating: null as Rating, notes: '' },
        { id: 'drv2', label: 'Control joints', hint: 'Proper spacing, not cracked through', rating: null as Rating, notes: '' },
        { id: 'drv3', label: 'Drainage & slope', hint: 'Proper slope, no pooling areas', rating: null as Rating, notes: '' },
        { id: 'drv4', label: 'Edges & borders', hint: 'Chipping, separation, heaving', rating: null as Rating, notes: '' },
      ],
      interlock: [
        { id: 'drv1', label: 'Surface condition', hint: 'Settled, heaved, or missing stones', rating: null as Rating, notes: '' },
        { id: 'drv2', label: 'Joint sand', hint: 'Erosion between pavers, weeds present', rating: null as Rating, notes: '' },
        { id: 'drv3', label: 'Drainage & slope', hint: 'Proper slope, no pooling areas', rating: null as Rating, notes: '' },
        { id: 'drv4', label: 'Edge restraints', hint: 'Secure, no displacement at borders', rating: null as Rating, notes: '' },
      ],
      gravel: [
        { id: 'drv1', label: 'Coverage & depth', hint: 'Even coverage, adequate depth', rating: null as Rating, notes: '' },
        { id: 'drv2', label: 'Drainage', hint: 'No pooling, proper grading', rating: null as Rating, notes: '' },
        { id: 'drv3', label: 'Edging', hint: 'Contained, not spreading onto lawn or road', rating: null as Rating, notes: '' },
      ],
      paver: [
        { id: 'drv1', label: 'Surface condition', hint: 'Cracked, chipped, or settled pavers', rating: null as Rating, notes: '' },
        { id: 'drv2', label: 'Joint condition', hint: 'Mortar or sand joints — erosion, weeds', rating: null as Rating, notes: '' },
        { id: 'drv3', label: 'Drainage & slope', hint: 'Proper slope, no pooling', rating: null as Rating, notes: '' },
        { id: 'drv4', label: 'Edge restraints', hint: 'Secure borders, no displacement', rating: null as Rating, notes: '' },
      ],
      mixed: [
        { id: 'drv1', label: 'Surface condition', hint: 'Cracks, settlement, damage across all materials', rating: null as Rating, notes: '' },
        { id: 'drv2', label: 'Transitions', hint: 'Material transitions — heaving, separation', rating: null as Rating, notes: '' },
        { id: 'drv3', label: 'Drainage & slope', hint: 'Proper slope throughout, no pooling', rating: null as Rating, notes: '' },
        { id: 'drv4', label: 'Overall condition', hint: 'General integrity and safety', rating: null as Rating, notes: '' },
      ],
    }[config.drivewayType]

    sections.push({
      id: 'driveway', type: 'driveway', label: drivewayLabel, enabled: true, notes: '',
      items: drivewayItems
    })
    const hvacItems = CHECKLIST.hvac.map(i => ({ ...i })).filter(i => {
      if (i.id === 'h2' && !config.hasCentralAc) return false
      if (i.id === 'h5' && !config.hasWoodFireplace && !config.hasGasFireplace) return false
      return true
    }).map(i => {
      if (i.id === 'h5' && config.hasGasFireplace && !config.hasWoodFireplace) {
        return { ...i, label: 'Gas fireplace', hint: 'Operation, venting, glass seal, shutoff' }
      }
      return i
    })

    sections.push({ id: 'hvac', type: 'hvac', label: 'HVAC', enabled: true, notes: '', items: hvacItems })
    sections.push({ id: 'kitchen', type: 'kitchen', label: 'Kitchen', enabled: true, notes: '', items: CHECKLIST.kitchen.map(i => ({ ...i })) })

    for (let i = 0; i < config.fullBaths; i++) {
      sections.push({
        id: `bath_${i}`, type: 'bathroom', label: `Bathroom ${i + 1}`, enabled: true, notes: '',
        items: CHECKLIST.bathroom.map(item => ({ ...item, id: `bath_${i}_${item.id}` }))
      })
    }

    for (let i = 0; i < config.halfBaths; i++) {
      sections.push({
        id: `halfbath_${i}`, type: 'bathroom', label: `Half bathroom ${i + 1}`, enabled: true, notes: '',
        items: CHECKLIST.half_bath.map(item => ({ ...item, id: `halfbath_${i}_${item.id}` }))
      })
    }

    for (let i = 0; i < config.bedrooms; i++) {
      sections.push({
        id: `bed_${i}`, type: 'bedroom', label: `Bedroom ${i + 1}`, enabled: true, notes: '',
        items: [
          { id: `bed_${i}_1`, label: 'Windows', hint: 'Operation, locks, seals, egress where required', rating: null, notes: '' },
          { id: `bed_${i}_2`, label: 'Flooring', hint: 'Condition, type, damage', rating: null, notes: '' },
          { id: `bed_${i}_3`, label: 'Outlets & switches', hint: 'Operation, covers, AFCI where required', rating: null, notes: '' },
          { id: `bed_${i}_4`, label: 'Closet', hint: 'Condition, shelving, door operation', rating: null, notes: '' },
          { id: `bed_${i}_5`, label: 'Ceiling & walls', hint: 'Cracks, staining, damage', rating: null, notes: '' },
        ]
      })
    }

    if (config.basementType !== 'none') {
      sections.push({ id: 'basement', type: 'basement', label: `Basement (${config.basementType})`, enabled: true, notes: '', items: CHECKLIST.basement.map(i => ({ ...i })) })
    }
    if (config.hasAttic) {
      sections.push({ id: 'attic', type: 'attic', label: 'Attic', enabled: true, notes: '', items: CHECKLIST.attic.map(i => ({ ...i })) })
    }
    if (config.hasGarage) {
      sections.push({ id: 'garage', type: 'garage', label: 'Garage', enabled: true, notes: '', items: CHECKLIST.garage.map(i => ({ ...i })) })
    }
    if (config.hasDeck) {
      const isHardscape = config.deckType === 'stone' || config.deckType === 'concrete' || config.deckType === 'interlock'
      const deckLabel = {
        wood: 'Wood deck',
        composite: 'Composite deck',
        stone: 'Stone patio',
        concrete: 'Concrete patio',
        interlock: 'Interlock patio',
      }[config.deckType]

      sections.push({
        id: 'deck', type: 'deck', label: deckLabel, enabled: true, notes: '',
        items: isHardscape ? [
          { id: 'deck1', label: 'Surface condition', hint: 'Cracks, settling, heaving, loose stones', rating: null, notes: '' },
          { id: 'deck2', label: 'Drainage', hint: 'Proper slope away from house, no pooling', rating: null, notes: '' },
          { id: 'deck3', label: 'Edge & border condition', hint: 'Secure edging, no displacement', rating: null, notes: '' },
          { id: 'deck4', label: 'Steps & transitions', hint: 'Safe, stable, proper rise and run', rating: null, notes: '' },
        ] : [
          { id: 'deck1', label: 'Decking boards', hint: 'Rot, damage, splinters, secure fastening', rating: null, notes: '' },
          { id: 'deck2', label: 'Railings & guards', hint: 'Height, spacing, secure attachment', rating: null, notes: '' },
          { id: 'deck3', label: 'Ledger board', hint: 'Properly attached to house, flashing present', rating: null, notes: '' },
          { id: 'deck4', label: 'Posts & footings', hint: 'Condition, proper support, no rot', rating: null, notes: '' },
          { id: 'deck5', label: 'Stairs', hint: 'Condition, handrail, rise and run', rating: null, notes: '' },
        ]
      })
    }

    if (config.hasFence) {
      sections.push({
        id: 'fence', type: 'fence', label: 'Fence', enabled: true, notes: '',
        items: [
          { id: 'fen1', label: 'Fence condition', hint: 'Rot, damage, missing boards or sections', rating: null, notes: '' },
          { id: 'fen2', label: 'Posts & footings', hint: 'Leaning, rot at base, secure in ground', rating: null, notes: '' },
          { id: 'fen3', label: 'Gates', hint: 'Operation, latches, self-closing if pool present', rating: null, notes: '' },
          { id: 'fen4', label: 'Overall integrity', hint: 'Secure perimeter, no gaps or hazards', rating: null, notes: '' },
        ]
      })
    }

    return sections
  }
const [sectionPhotos, setSectionPhotos] = useState<Record<string, {file: File, preview: string, caption: string}[]>>({})
  const [upsellModal, setUpsellModal] = useState<{
    show: boolean
    sectionId: string
    files: FileList | null
    upgrade: { tier: string, label: string, limit: number }
  } | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [webLink, setWebLink] = useState<string | null>(null)
  const [emailConfirmed, setEmailConfirmed] = useState(false)

const getTierLimit = () => {
    switch (selectedTier) {
      case 'text': return 0
      case 'basic': return 5
      case 'pro': return 15
      case 'pro_plus': return 30
      case 'unlimited': return Infinity
      default: return 0
    }
  }

  const getTierUpgrade = (currentCount: number) => {
    if (currentCount < 5) return { tier: 'basic', label: 'Basic', limit: 5 }
    if (currentCount < 15) return { tier: 'pro', label: 'Pro', limit: 15 }
    if (currentCount < 30) return { tier: 'pro_plus', label: 'Pro+', limit: 30 }
    return { tier: 'unlimited', label: 'Unlimited', limit: Infinity }
  }

  const totalPhotos = Object.values(sectionPhotos).reduce((acc, photos) => acc + photos.length, 0)

  const handlePhotoAdd = (sectionId: string, files: FileList | null) => {
    if (!files) return
    const limit = getTierLimit()
    const newFiles = Array.from(files)
    const currentTotal = totalPhotos
    const wouldBe = currentTotal + newFiles.length

    if (wouldBe > limit) {
      const upgrade = getTierUpgrade(limit)
      setUpsellModal({ show: true, sectionId, files, upgrade })
      return
    }

    const newPhotos = newFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      caption: '',
    }))

    setSectionPhotos(prev => ({
      ...prev,
      [sectionId]: [...(prev[sectionId] || []), ...newPhotos],
    }))
  }

  const removePhoto = (sectionId: string, idx: number) => {
    setSectionPhotos(prev => ({
      ...prev,
      [sectionId]: prev[sectionId].filter((_, i) => i !== idx),
    }))
  }

  const updatePhotoCaption = (sectionId: string, idx: number, caption: string) => {
    setSectionPhotos(prev => ({
      ...prev,
      [sectionId]: prev[sectionId].map((p, i) => i === idx ? { ...p, caption } : p),
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      // Upload photos to Supabase Storage first
      const photoData: Record<string, {path: string, caption: string}[]> = {}
      
      for (const [sectionId, photos] of Object.entries(sectionPhotos)) {
        if (photos.length === 0) continue
       const sectionLabel = sections.find(s => s.id === sectionId)?.label || sectionId
        if (!photoData[sectionLabel]) photoData[sectionLabel] = []
        for (const photo of photos) {
          const ext = photo.file.name.split('.').pop()
          const path = `pending/${sectionLabel.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
          const { createClient } = await import('@/lib/supabase/client')
          const supabase = createClient()
          await supabase.storage.from('photos').upload(path, photo.file, { upsert: true })
          photoData[sectionLabel].push({ path, caption: photo.caption })
        }
      }

      const response = await fetch('/api/inspections/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property,
          config,
          sections,
          selectedTier,
          photoData,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Submission failed')
      setWebLink(result.webLink)
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const updateProp = (f: string, v: string) => {
    setError(null)
    setProperty(p => ({ ...p, [f]: v }))
  }
  const updateConfig = (f: string, v: unknown) => setConfig(c => ({ ...c, [f]: v }))

  const setRating = (sectionId: string, itemId: string, rating: Rating) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, items: s.items.map(item => item.id === itemId ? { ...item, rating } : item) }
        : s
    ))
  }

  const setItemNotes = (sectionId: string, itemId: string, notes: string) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, items: s.items.map(item => item.id === itemId ? { ...item, notes } : item) }
        : s
    ))
  }

  const setSectionNotes = (sectionId: string, notes: string) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, notes } : s))
  }

  const ratingColors: Record<string, string> = {
    ok: 'bg-green-100 text-green-700 border-green-300',
    mon: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    def: 'bg-red-100 text-red-700 border-red-300',
    haz: 'bg-gray-900 text-white border-gray-900',
  }

  const ratingLabels: Record<string, string> = {
    ok: 'OK', mon: 'MON', def: 'DEF', haz: 'HAZ'
  }

  const completedItems = sections.reduce((acc, s) => acc + s.items.filter(i => i.rating).length, 0)
  const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/brand/domicert-mark.svg" alt="Domicert" width={28} height={28} />
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">← Dashboard</Link>
          </div>
          <div className="text-sm font-medium text-gray-900">New inspection</div>
          <div className="text-sm text-gray-400">
            {step === 3 && totalItems > 0 && `${completedItems}/${totalItems} items rated`}
          </div>
        </div>
      </nav>

      {/* Step indicator */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-8 py-3">
          <div className="flex items-center gap-2">
            {['Property & client', 'Configure rooms', 'Inspect', 'Review & submit'].map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 text-xs font-medium ${step === i + 1 ? 'text-[#1D9E75]' : step > i + 1 ? 'text-gray-400' : 'text-gray-300'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step === i + 1 ? 'bg-[#1D9E75] text-white' : step > i + 1 ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 text-gray-300'}`}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  {label}
                </div>
                {i < 3 && <div className="w-8 h-px bg-gray-200" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8">

        {/* STEP 1 — Property & client */}
        {step === 1 && (
          <div className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}
            {/* Tier selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-medium text-gray-900 mb-1">Select report tier</h2>
              <p className="text-sm text-gray-500 mb-4">Choose based on how many photos you'll include</p>
              <div className="grid grid-cols-5 gap-2">
                {TIERS.map(tier => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id as Tier)}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      selectedTier === tier.id
                        ? 'border-[#1D9E75] bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-900">{tier.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{tier.desc}</div>
                    <div className="text-xs font-medium text-[#1D9E75] mt-1">
                      Free period
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Property details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-medium text-gray-900 mb-4">Property details</h2>
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">Street address</label>
                <input
                  type="text"
                  value={property.address}
                  onChange={e => updateProp('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400"
                  placeholder="42 Maple Ave"
                />
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">City</label>
                  <input type="text" value={property.city} onChange={e => updateProp('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400" placeholder="Toronto" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Province / State</label>
                  <select value={property.provinceState} onChange={e => updateProp('provinceState', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 bg-white">
                    <option value="AB">Alberta</option>
                    <option value="BC">British Columbia</option>
                    <option value="MB">Manitoba</option>
                    <option value="ON">Ontario</option>
                    <option value="QC">Quebec</option>
                    <option value="SK">Saskatchewan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Postal code</label>
                  <input type="text" value={property.postalZip} onChange={e => updateProp('postalZip', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400" placeholder="M5V 2T6" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Property type</label>
                  <select value={property.propertyType} onChange={e => updateProp('propertyType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 bg-white">
                    <option value="single_family">Single-family home</option>
                    <option value="semi">Semi-detached</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="condo">Condo</option>
                    <option value="multi">Multi-unit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Year built (approx)</label>
                  <input type="text" value={property.yearBuilt} onChange={e => updateProp('yearBuilt', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400" placeholder="1987" />
                </div>
              </div>
            </div>

            {/* Client details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-medium text-gray-900 mb-4">Client details</h2>
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">Client full name</label>
                <input type="text" value={property.clientName} onChange={e => updateProp('clientName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400" placeholder="John Buyer" />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Client email</label>
                  <input type="email" value={property.clientEmail} onChange={e => updateProp('clientEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400" placeholder="john@email.com" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Client phone</label>
                  <input type="tel" value={property.clientPhone} onChange={e => updateProp('clientPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400" placeholder="(416) 555-0199" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Agreed inspection fee ($)</label>
                  <input type="text" value={property.inspectionFee} onChange={e => updateProp('inspectionFee', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400" placeholder="500.00" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Inspection date</label>
                  <input type="date" value={property.inspectionDate} onChange={e => updateProp('inspectionDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900" />
                </div>
              </div>
            </div>

            <button
  onClick={() => {
    if (!property.address) { setError('Please enter the property street address'); return }
    if (!property.city) { setError('Please enter the city'); return }
    if (!property.postalZip) { setError('Please enter the postal / ZIP code'); return }
    if (!property.clientName) { setError('Please enter the client name'); return }
    if (!property.clientEmail) { setError('Please enter the client email'); return }
    if (!property.clientEmail.includes('@')) { setError('Please enter a valid email address'); return }
    if (!property.inspectionFee || isNaN(parseFloat(property.inspectionFee))) { setError('Please enter a valid inspection fee'); return }
    if (!property.inspectionDate) { setError('Please select the inspection date'); return }
    setError(null)
    setStep(2)
  }}
  className="w-full py-3 bg-[#1D9E75] text-white rounded-lg font-medium hover:bg-[#0F6E56] transition-colors"
>
  Next: Configure rooms →
</button>
          </div>
        )}

        {/* STEP 2 — Configure rooms */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-medium text-gray-900 mb-4">Property structure</h2>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Floors', field: 'floors', min: 1, max: 4 },
                  { label: 'Bedrooms', field: 'bedrooms', min: 0, max: 8 },
                  { label: 'Full baths', field: 'fullBaths', min: 0, max: 6 },
                  { label: 'Half baths', field: 'halfBaths', min: 0, max: 4 },
                ].map(({ label, field, min, max }) => (
                  <div key={field}>
                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                    <select
                      value={config[field as keyof typeof config] as number}
                      onChange={e => updateConfig(field, parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 bg-white"
                    >
                      {Array.from({ length: max - min + 1 }, (_, i) => i + min).map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-medium text-gray-900 mb-4">Areas to inspect</h2>

              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1">Roof type</label>
                <select value={config.roofType} onChange={e => updateConfig('roofType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 bg-white">
                  <option value="asphalt_shingle">Asphalt shingles</option>
                  <option value="metal">Metal roof</option>
                  <option value="flat">Flat / low slope</option>
                  <option value="cedar_shake">Cedar shake</option>
                  <option value="slate">Slate</option>
                  <option value="tile">Clay / concrete tile</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1">Basement</label>
                <select value={config.basementType} onChange={e => updateConfig('basementType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 bg-white">
                  <option value="none">No basement</option>
                  <option value="unfinished">Unfinished basement</option>
                  <option value="partial">Partially finished basement</option>
                  <option value="finished">Finished basement</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Garage', field: 'hasGarage' },
                  { label: 'Attic', field: 'hasAttic' },
                  { label: 'Crawlspace', field: 'hasCrawlspace' },
                  { label: 'Pool / hot tub', field: 'hasPool' },
                  { label: 'Central A/C', field: 'hasCentralAc' },
                  { label: 'Forced air furnace', field: 'hasForcedAir' },
                  { label: 'Wood fireplace', field: 'hasWoodFireplace' },
                  { label: 'Gas fireplace', field: 'hasGasFireplace' },
                  { label: 'Sump pump', field: 'hasSumpPump' },
                  { label: 'Fence', field: 'hasFence' },
                ].map(({ label, field }) => (
                  <label key={field} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={config[field as keyof typeof config] as boolean}
                      onChange={e => updateConfig(field, e.target.checked)}
                      className="w-4 h-4 accent-[#1D9E75]"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-3 border border-gray-200 rounded-lg p-3">
                <label className="flex items-center gap-3 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.hasDeck}
                    onChange={e => updateConfig('hasDeck', e.target.checked)}
                    className="w-4 h-4 accent-[#1D9E75]"
                  />
                  <span className="text-sm text-gray-700">Deck / patio</span>
                </label>
                {config.hasDeck && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Surface type</label>
                    <select
                      value={config.deckType}
                      onChange={e => updateConfig('deckType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 bg-white"
                    >
                      <option value="wood">Wood deck</option>
                      <option value="composite">Composite deck</option>
                      <option value="stone">Stone patio</option>
                      <option value="concrete">Concrete patio</option>
                      <option value="interlock">Interlock / paving stones</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-3 border border-gray-200 rounded-lg p-3">
                <label className="block text-xs text-gray-500 mb-2">Driveway material</label>
                <select
                  value={config.drivewayType}
                  onChange={e => updateConfig('drivewayType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 bg-white"
                >
                  <option value="asphalt">Asphalt</option>
                  <option value="concrete">Concrete</option>
                  <option value="interlock">Interlock / paving stones</option>
                  <option value="gravel">Gravel</option>
                  <option value="paver">Paver stones</option>
                  <option value="mixed">Mixed materials</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="px-6 py-3 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                ← Back
              </button>
              <button
                onClick={() => { setSections(buildSections()); setStep(3) }}
                className="flex-1 py-3 bg-[#1D9E75] text-white rounded-lg font-medium hover:bg-[#0F6E56] transition-colors">
                Begin inspection →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Inspect */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Legend */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-6 flex-wrap">
                <span className="text-xs font-medium text-gray-500">Rating legend:</span>
                {[
                  { code: 'ok', label: 'OK', desc: 'Acceptable — no action required', color: 'bg-green-100 text-green-700' },
                  { code: 'mon', label: 'MON', desc: 'Monitor — address within 12 months', color: 'bg-yellow-100 text-yellow-700' },
                  { code: 'def', label: 'DEF', desc: 'Defect — repair recommended', color: 'bg-red-100 text-red-700' },
                  { code: 'haz', label: 'HAZ', desc: 'Hazard — immediate attention required', color: 'bg-gray-900 text-white' },
                ].map(r => (
                  <div key={r.code} className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.color}`}>{r.label}</span>
                    <span className="text-xs text-gray-500">{r.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sections */}
            {sections.map(section => {
              const isExpanded = expandedSection === section.id
              const rated = section.items.filter(i => i.rating).length
              const total = section.items.length
              const hasHaz = section.items.some(i => i.rating === 'haz')
              const hasDef = section.items.some(i => i.rating === 'def')

              return (
                <div key={section.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900 text-sm">{section.label}</span>
                      {hasHaz && <span className="px-1.5 py-0.5 bg-gray-900 text-white text-xs rounded">HAZ</span>}
                      {hasDef && !hasHaz && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">DEF</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      {total > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${rated === total ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {rated === total ? '✓ Complete' : `${rated}/${total}`}
                        </span>
                      )}
                      <span className="text-gray-400 text-sm">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4">
                      {section.items.length > 0 ? (
                        <div className="space-y-4 mb-4">
                          {section.items.map(item => (
                            <div key={item.id} className="border border-gray-100 rounded-lg p-3">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">{item.label}</div>
                                  <div className="text-xs text-gray-400 mt-0.5">{item.hint}</div>
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0">
                                  {(['ok', 'mon', 'def', 'haz'] as Rating[]).map(r => (
                                    <button
                                      key={r}
                                      onClick={() => setRating(section.id, item.id, item.rating === r ? null : r)}
                                      className={`px-2 py-1 rounded border text-xs font-medium transition-colors ${
                                        item.rating === r
                                          ? ratingColors[r!]
                                          : 'border-gray-200 text-gray-400 hover:border-gray-300'
                                      }`}
                                    >
                                      {ratingLabels[r!]}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              {(item.rating === 'mon' || item.rating === 'def' || item.rating === 'haz') && (
                                <textarea
                                  placeholder="Add notes for this item..."
                                  value={item.notes}
                                  onChange={e => setItemNotes(section.id, item.id, e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400 resize-none mt-1"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 mb-4">No checklist items for this section — add your notes below.</p>
                      )}

                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Section notes</label>
                        <textarea
                          placeholder="Overall notes for this section..."
                          value={section.notes}
                          onChange={e => setSectionNotes(section.id, e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400 resize-none"
                        />
                      </div>

                      <div className="mt-3">
  <div className="flex items-center justify-between mb-1">
    <label className="block text-xs text-gray-500">Photos</label>
    <span className="text-xs text-gray-400">
      {(sectionPhotos[section.id] || []).length} / {
        selectedTier === 'text' ? 0 :
        selectedTier === 'basic' ? 5 :
        selectedTier === 'pro' ? 15 :
        selectedTier === 'pro_plus' ? 30 : '∞'
      }
    </span>
  </div>

  {/* Existing photos */}
  {(sectionPhotos[section.id] || []).length > 0 && (
    <div className="grid grid-cols-3 gap-2 mb-2">
      {(sectionPhotos[section.id] || []).map((photo, idx) => (
        <div key={idx} className="relative group">
          <img
            src={photo.preview}
            alt={photo.caption || `Photo ${idx + 1}`}
            className="w-full h-24 object-cover rounded-lg border border-gray-200"
          />
          <button
            onClick={() => removePhoto(section.id, idx)}
            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ×
          </button>
          <input
            type="text"
            placeholder="Add caption..."
            value={photo.caption}
            onChange={e => updatePhotoCaption(section.id, idx, e.target.value)}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400"
          />
        </div>
      ))}
    </div>
  )}

  {/* Add photo button */}
  {selectedTier !== 'text' && (
    <label className="block border-2 border-dashed border-gray-200 rounded-lg p-3 text-center cursor-pointer hover:border-[#1D9E75] transition-colors">
      <div className="text-xs text-gray-400">📷 Add photo</div>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={e => handlePhotoAdd(section.id, e.target.files)}
        className="hidden"
      />
    </label>
  )}

  {selectedTier === 'text' && (
    <div className="border-2 border-dashed border-gray-100 rounded-lg p-3 text-center">
      <div className="text-xs text-gray-300">Photos not available on Text tier</div>
    </div>
  )}
</div>
                    </div>
                  )}
                </div>
              )
            })}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(2)}
                className="px-6 py-3 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50">
                ← Back
              </button>
              <button onClick={() => setStep(4)}
                className="flex-1 py-3 bg-[#1D9E75] text-white rounded-lg font-medium hover:bg-[#0F6E56] transition-colors">
                Review & submit →
              </button>
            </div>
          </div>
        )}
{/* UPSELL MODAL */}
        {upsellModal?.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
              <h3 className="font-medium text-gray-900 mb-2">Photo limit reached</h3>
              <p className="text-sm text-gray-500 mb-6">
                You've reached the limit for your current tier. 
                Upgrade to <strong>{upsellModal.upgrade.label}</strong> to add up to {upsellModal.upgrade.limit} photos.
                During your free trial, no charges apply.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setUpsellModal(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Stay on {selectedTier.replace('_', '+')}
                </button>
                <button
                  onClick={() => {
                    setSelectedTier(upsellModal.upgrade.tier as typeof selectedTier)
                    const newPhotos = Array.from(upsellModal.files || []).map(file => ({
                      file,
                      preview: URL.createObjectURL(file),
                      caption: '',
                    }))
                    setSectionPhotos(prev => ({
                      ...prev,
                      [upsellModal.sectionId]: [...(prev[upsellModal.sectionId] || []), ...newPhotos],
                    }))
                    setUpsellModal(null)
                  }}
                  className="flex-1 py-2.5 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#0F6E56]"
                >
                  Upgrade to {upsellModal.upgrade.label}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* SUCCESS SCREEN */}
        {submitted && (
          <div className="max-w-lg mx-auto text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#1D9E75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-medium text-gray-900 mb-2">Report sent!</h2>
            <p className="text-gray-500 mb-2">
              The full PDF report has been emailed to <strong>{property.clientEmail}</strong>
            </p>
            <p className="text-gray-500 mb-8 text-sm">
              This inspection is now stored in the Domicert database.
            </p>
            {webLink && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-xs text-gray-500 mb-1">Client web link (valid 2 years):</p>
                <p className="text-xs text-[#1D9E75] break-all">{webLink}</p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <Link
                href="/dashboard"
                className="px-6 py-2.5 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#0F6E56] transition-colors"
              >
                Back to dashboard
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false)
                  setStep(1)
                  setProperty({
                    address: '', city: '', provinceState: 'ON', postalZip: '',
                    country: 'CA', yearBuilt: '', propertyType: 'single_family',
                    clientName: '', clientEmail: '', clientPhone: '',
                    inspectionFee: '', inspectionDate: '',
                  })
                  setSections([])
                }}
                className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                New inspection
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Review & submit */}
        {step === 4 && !submitted && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-medium text-gray-900 mb-4">Inspection summary</h2>
              <div className="grid grid-cols-2 gap-3 text-sm mb-6">
                <div><span className="text-gray-500">Property:</span> <span className="text-gray-900">{property.address}, {property.city}</span></div>
                <div><span className="text-gray-500">Client:</span> <span className="text-gray-900">{property.clientName}</span></div>
                <div><span className="text-gray-500">Date:</span> <span className="text-gray-900">{property.inspectionDate}</span></div>
                <div><span className="text-gray-500">Tier:</span> <span className="text-gray-900 capitalize">{selectedTier.replace('_', '+')}</span></div>
              </div>

              {/* Findings summary */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Hazards', rating: 'haz', color: 'bg-gray-900 text-white' },
                  { label: 'Defects', rating: 'def', color: 'bg-red-50 text-red-700' },
                  { label: 'Monitor', rating: 'mon', color: 'bg-yellow-50 text-yellow-700' },
                  { label: 'Acceptable', rating: 'ok', color: 'bg-green-50 text-green-700' },
                ].map(({ label, rating, color }) => {
                  const count = sections.reduce((acc, s) => acc + s.items.filter(i => i.rating === rating).length, 0)
                  return (
                    <div key={rating} className={`rounded-lg p-4 text-center ${color}`}>
                      <div className="text-2xl font-medium">{count}</div>
                      <div className="text-xs mt-0.5">{label}</div>
                    </div>
                  )
                })}
              </div>

              {/* Issues list */}
              {sections.some(s => s.items.some(i => i.rating === 'haz' || i.rating === 'def')) && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Items requiring attention</h3>
                  <div className="space-y-2">
                    {sections.flatMap(s => s.items
                      .filter(i => i.rating === 'haz' || i.rating === 'def')
                      .map(i => (
                        <div key={i.id} className={`flex items-start gap-3 p-3 rounded-lg border ${i.rating === 'haz' ? 'border-gray-200 bg-gray-50' : 'border-red-100 bg-red-50'}`}>
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${i.rating === 'haz' ? 'bg-gray-900 text-white' : 'bg-red-100 text-red-700'}`}>
                            {i.rating?.toUpperCase()}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{i.label}</div>
                            <div className="text-xs text-gray-500">{s.label}</div>
                            {i.notes && <div className="text-xs text-gray-600 mt-1">{i.notes}</div>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Send report */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-medium text-gray-900 mb-4">Send report to client</h2>
              <div className="mb-3">
  <label className="block text-xs text-gray-500 mb-1">Client email</label>
  <input 
    type="email" 
    value={property.clientEmail}
    onChange={e => {
      updateProp('clientEmail', e.target.value)
      setEmailConfirmed(false)
    }}
    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900" />
</div>
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1">Personal message (optional)</label>
                <textarea rows={3} placeholder="Hi, please find your inspection report attached..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] text-gray-900 placeholder-gray-400 resize-none" />
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-xs text-gray-500">
  The client will receive a branded PDF report and a secure link to view it online for 2 years.
</div>
<label className="flex items-start gap-3 p-3 border-2 border-yellow-200 bg-yellow-50 rounded-lg cursor-pointer">
  <input
    type="checkbox"
    checked={emailConfirmed}
    onChange={e => setEmailConfirmed(e.target.checked)}
    className="w-4 h-4 accent-[#1D9E75] mt-0.5 flex-shrink-0"
  />
  <span className="text-sm text-yellow-800">
    I confirm <strong>{property.clientEmail}</strong> is the correct email address for this client. 
    The report will be sent here and cannot be automatically recalled.
  </span>
</label>
            </div>
{submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {submitError}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setStep(3); setEmailConfirmed(false) }}
                className="px-6 py-3 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50">
                ← Back
              </button>
              <button
  onClick={handleSubmit}
  disabled={submitting || !emailConfirmed}
  className="flex-1 py-3 bg-[#1D9E75] text-white rounded-lg font-medium hover:bg-[#0F6E56] transition-colors disabled:opacity-50">
  {submitting ? 'Generating report...' : 'Submit & email report →'}
</button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}