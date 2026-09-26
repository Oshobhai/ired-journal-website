'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Publication = {
  id: string
  title: string
  status: 'draft' | 'published' | 'archived'
  pdf_path: string
  cover_path?: string | null
  created_at: string
  authors?: string
  editors?: string | null
  publication_year?: number | null
  publication_month?: string | null
 