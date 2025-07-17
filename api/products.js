// /api/products.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lsxojnbkbqhuwaydiqqb.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    console.log('🔍 Obteniendo productos desde Supabase...')
    const { data, error } = await supabase.from('products').select('*')

    if (error) {
      console.error('❌ Error de Supabase:', error.message)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json(data)
  } catch (err) {
    console.error('🔥 Error general en /api/products:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
