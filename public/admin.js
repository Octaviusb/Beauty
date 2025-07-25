// admin.js
const supabase = window.supabase.createClient(
  'https://lsxojnbkbqhuwaydiqqb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG9qbmJrYnFodXdheWRpcXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDYzMzAsImV4cCI6MjA2ODA4MjMzMH0.uHQJ_F3NmeM2U4EsIq_UFSPMKd35MlMZnrboKOIy45g'
);

const tableBody = document.getElementById("productsTable");
const form = document.getElementById("addForm");

// Autenticación básica para el panel de administración
function checkAuth() {
  const isAuthenticated = sessionStorage.getItem('adminAuth');
  if (!isAuthenticated) {
    const password = prompt('Ingrese la contraseña de administrador:');
    if (password === 'admin') { // Contraseña simple para demo
      sessionStorage.setItem('adminAuth', 'true');
    } else {
      alert('Contraseña incorrecta');
      window.location.href = '/';
    }
  }
}

// Cargar productos desde Supabase o API
async function cargarProductos() {
  try {
    // Intentar cargar desde Supabase
    const { data, error } = await supabase.from("products").select("*");
    
    if (error || !data || data.length === 0) {
      // Si hay error o no hay datos, intentar cargar desde la API
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Error al cargar productos desde API');
      const apiData = await response.json();
      renderizarProductos(apiData);
    } else {
      // Si hay datos en Supabase, usarlos
      renderizarProductos(data);
    }
  } catch (err) {
    console.error('Error al cargar productos:', err);
    alert('Error al cargar productos. Intente nuevamente.');
  }
}

// Renderizar productos en la tabla
function renderizarProductos(productos) {
  tableBody.innerHTML = "";
  productos.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input value="${p.name}" data-id="${p.id}" data-field="name"></td>
      <td><input value="${p.category}" data-id="${p.id}" data-field="category"></td>
      <td><input value="${p.price}" data-id="${p.id}" data-field="price"></td>
      <td><input value="${p.description || ''}" data-id="${p.id}" data-field="description"></td>
      <td><input value="${p.image || ''}" data-id="${p.id}" data-field="image"></td>
      <td>
        <button onclick="guardar(${p.id})">Guardar</button>
        <button class="delete" onclick="eliminar(${p.id})">Eliminar</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

// Guardar cambios en un producto
async function guardar(id) {
  const inputs = document.querySelectorAll(`[data-id="${id}"]`);
  const datos = {};
  inputs.forEach(i => datos[i.dataset.field] = i.value);
  datos.price = Number(datos.price);

  try {
    // Intentar actualizar en Supabase
    const { error } = await supabase.from("products").update(datos).eq("id", id);
    
    if (error) {
      // Si hay error, intentar actualizar a través de la API
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      
      if (!response.ok) throw new Error('Error al actualizar producto');
    }
    
    alert("✅ Producto actualizado");
    cargarProductos(); // Recargar para ver cambios
  } catch (err) {
    console.error('Error al guardar:', err);
    alert('Error al actualizar el producto');
  }
}

// Eliminar un producto
async function eliminar(id) {
  if (!confirm("¿Eliminar este producto?")) return;
  
  try {
    // Intentar eliminar en Supabase
    const { error } = await supabase.from("products").delete().eq("id", id);
    
    if (error) {
      // Si hay error, intentar eliminar a través de la API
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Error al eliminar producto');
    }
    
    cargarProductos(); // Recargar la lista
  } catch (err) {
    console.error('Error al eliminar:', err);
    alert('Error al eliminar el producto');
  }
}

// Agregar un nuevo producto
form.addEventListener("submit", async e => {
  e.preventDefault();
  const datos = Object.fromEntries(new FormData(form));
  datos.price = Number(datos.price);
  
  try {
    // Intentar insertar en Supabase
    const { error } = await supabase.from("products").insert(datos);
    
    if (error) {
      // Si hay error, intentar insertar a través de la API
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      
      if (!response.ok) throw new Error('Error al agregar producto');
    }
    
    form.reset();
    cargarProductos(); // Recargar la lista
  } catch (err) {
    console.error('Error al agregar:', err);
    alert('Error al agregar el producto');
  }
});

// Inicializar
checkAuth();
cargarProductos();