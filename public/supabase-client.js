// supabase-client.js

// ✅ Importar el cliente desde el CDN de Supabase (versión ESM compatible)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// ✅ Claves de Supabase
const SUPABASE_URL = 'https://ixnfhwvbwcxnwfhqpnzs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4bmZod3Zid2N4bndmaHFwbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc0NTM3NzcsImV4cCI6MjAzMzAyOTc3N30.Yd9hQiK_-eFxJJKO9PgMUVvGdL1JYnQnIGmA3QPcwQE';

// ✅ Inicializar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ✅ Exportar funciones desde un único objeto sin sobrescribir
window.supabaseClient = {
  // Obtener productos desde Supabase
  async cargarProductosSupabase() {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error al cargar productos desde Supabase:', error);
      throw error;
    }
  },

  // Guardar pedidos en la tabla "pedidos"
  async guardarPedido(pedido) {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .insert([pedido]);

      if (error) {
        console.error('❌ Error al guardar pedido:', error);
        throw error;
      }

      console.log('✅ Pedido guardado en Supabase:', data);
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Exportar también el cliente directamente si lo necesitas en otros scripts
  supabase
};
