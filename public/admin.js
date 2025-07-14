// admin.js
const supabase = supabase.createClient(
  'https://lsxojnbkbqhuwaydiqqb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
);

const tableBody = document.querySelector("#productsTable tbody");
const addForm = document.getElementById("addForm");

async function cargarProductos() {
  const { data, error } = await supabase.from("products").select("*");
  if (error) return alert("Error al cargar productos");

  tableBody.innerHTML = "";
  data.forEach(producto => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input value="${producto.name}" data-id="${producto.id}" data-field="name"/></td>
      <td><input value="${producto.category}" data-id="${producto.id}" data-field="category"/></td>
      <td><input value="${producto.price}" data-id="${producto.id}" data-field="price"/></td>
      <td><input value="${producto.description || ""}" data-id="${producto.id}" data-field="description"/></td>
      <td><input value="${producto.image || ""}" data-id="${producto.id}" data-field="image"/></td>
      <td>
        <button onclick="guardar(${producto.id})">💾</button>
        <button onclick="eliminar(${producto.id})">🗑</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

async function guardar(id) {
  const inputs = document.querySelectorAll(`[data-id="${id}"]`);
  const cambios = {};
  inputs.forEach(input => cambios[input.dataset.field] = input.value);

  const { error } = await supabase.from("products").update(cambios).eq("id", id);
  if (error) return alert("Error al guardar");
  alert("✅ Producto actualizado");
}

async function eliminar(id) {
  const confirmar = confirm("¿Eliminar este producto?");
  if (!confirmar) return;

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return alert("Error al eliminar");
  cargarProductos();
}

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(addForm);
  const nuevo = Object.fromEntries(formData.entries());
  nuevo.price = Number(nuevo.price);

  const { error } = await supabase.from("products").insert(nuevo);
  if (error) return alert("Error al agregar producto");
  addForm.reset();
  cargarProductos();
});

cargarProductos();
