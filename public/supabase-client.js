// Conexión con Supabase
const SUPABASE_URL = 'https://ixnfhwvbwcxnwfhqpnzs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4bmZod3Zid2N4bndmaHFwbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc0NTM3NzcsImV4cCI6MjAzMzAyOTc3N30.Yd9hQiK_-eFxJJKO9PgMUVvGdL1JYnQnIGmA3QPcwQE';

// Inicializar el cliente de Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Función para cargar productos desde Supabase
async function cargarProductosSupabase() {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al cargar productos desde Supabase:', error);
    throw error;
  }
}

// Agrega esta función para guardar pedidos:
window.supabaseClient = {
  async guardarPedido(pedido) {
    const { data, error } = await window.supabase
      .from('pedidos')
      .insert([pedido]);

    if (error) {
      console.error('❌ Error al guardar pedido:', error);
      throw error;
    }

    console.log('✅ Pedido guardado en Supabase:', data);
    return data;
  }
};

// Exportar funciones
window.supabaseClient = {
  cargarProductosSupabase
};
