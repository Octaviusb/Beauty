// admin.js
const supabase = supabase.createClient(
  'https://lsxojnbkbqhuwaydiqqb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG9qbmJrYnFodXdheWRpcXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDYzMzAsImV4cCI6MjA2ODA4MjMzMH0.uHQJ_F3NmeM2U4EsIq_UFSPMKd35MlMZnrboKOIy45g'
);

const tableBody = document.getElementById("productsTable");
const form = document.getElementById("addForm");

async function cargarProductos() {
  const { data, error } = await supabase.from("products").select("*");
  if (error) return alert("Error al cargar productos");

  tableBody.innerHTML = "";
  data.forEach(p => {
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

async function guardar(id) {
  const inputs = document.querySelectorAll(`[data-id="${id}"]`);
  const datos = {};
  inputs.forEach(i => datos[i.dataset.field] = i.value);

  const { error } = await supabase.from("products").update(datos).eq("id", id);
  if (error) return alert("Error al actualizar");
  alert("✅ Producto actualizado");
}

async function eliminar(id) {
  if (!confirm("¿Eliminar este producto?")) return;
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return alert("Error al eliminar");
  cargarProductos();
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  const datos = Object.fromEntries(new FormData(form));
  datos.price = Number(datos.price);

  const { error } = await supabase.from("products").insert(datos);
  if (error) return alert("Error al agregar");
  form.reset();
  cargarProductos();
});

cargarProductos();