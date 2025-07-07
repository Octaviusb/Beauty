document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/api/products';
    // ESTA ES LA CONTRASEÑA Y EL SECRETO. ¡Cámbialos por algo más seguro!
    const ADMIN_PASSWORD = 'admin';
    const API_SECRET = 'super-secret-key';

    const productFormContainer = document.getElementById('product-form-container');
    const productForm = document.getElementById('product-form');
    const formTitle = document.getElementById('form-title');
    const productIdInput = document.getElementById('product-id');
    const productsTbody = document.getElementById('products-tbody');
    const btnNewProduct = document.getElementById('btn-new-product');
    const btnCancel = document.getElementById('btn-cancel');

    let products = [];

    // --- AUTENTICACIÓN ---
    function authenticate() {
        const password = prompt('Por favor, introduce la contraseña de administrador:');
        if (password !== ADMIN_PASSWORD) {
            alert('Contraseña incorrecta. Acceso denegado.');
            document.body.innerHTML = '<h1>Acceso Denegado</h1>';
            return false;
        }
        return true;
    }

    // --- RENDERIZADO ---
    function renderTable() {
        productsTbody.innerHTML = '';
        products.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.id}</td>
                <td><img src="${p.image || './images/default-product.jpg'}" alt="${p.name}" width="50"></td>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>$${p.price.toLocaleString('es-CO')}</td>
                <td>
                    <button class="btn btn-secondary btn-edit" data-id="${p.id}">Editar</button>
                    <button class="btn btn-danger btn-delete" data-id="${p.id}">Eliminar</button>
                </td>
            `;
            productsTbody.appendChild(tr);
        });
    }

    // --- LÓGICA DEL FORMULARIO ---
    function showForm(product = null) {
        if (product) {
            formTitle.textContent = 'Editar Producto';
            productIdInput.value = product.id;
            document.getElementById('name').value = product.name;
            document.getElementById('category').value = product.category;
            document.getElementById('price').value = product.price;
            document.getElementById('description').value = product.description || '';
            document.getElementById('image').value = product.image || '';
            document.getElementById('badge').value = product.badge || '';
        } else {
            formTitle.textContent = 'Crear Producto';
            productForm.reset();
            productIdInput.value = '';
        }
        productFormContainer.style.display = 'block';
    }

    function hideForm() {
        productFormContainer.style.display = 'none';
        productForm.reset();
    }

    // --- LLAMADAS A LA API ---
    async function fetchProducts() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Error al cargar los productos');
            products = await response.json();
            renderTable();
        } catch (error) {
            alert(error.message);
        }
    }

    async function saveProduct(productData) {
        const id = productIdInput.value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Secret': API_SECRET
                },
                body: JSON.stringify(productData)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Error al guardar el producto');
            }

            hideForm();
            await fetchProducts(); // Recargar la tabla
        } catch (error) {
            alert(error.message);
        }
    }

    async function deleteProduct(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'X-Admin-Secret': API_SECRET }
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Error al eliminar el producto');
            }

            await fetchProducts(); // Recargar la tabla
        } catch (error) {
            alert(error.message);
        }
    }

    // --- MANEJO DE EVENTOS ---
    btnNewProduct.addEventListener('click', () => showForm());
    btnCancel.addEventListener('click', hideForm);

    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const productData = {
            name: document.getElementById('name').value,
            category: document.getElementById('category').value,
            price: parseFloat(document.getElementById('price').value),
            description: document.getElementById('description').value,
            image: document.getElementById('image').value,
            badge: document.getElementById('badge').value
        };
        saveProduct(productData);
    });

    productsTbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-edit')) {
            const id = e.target.dataset.id;
            const product = products.find(p => String(p.id) === id);
            if (product) showForm(product);
        }
        if (e.target.classList.contains('btn-delete')) {
            const id = e.target.dataset.id;
            deleteProduct(id);
        }
    });

    // --- INICIALIZACIÓN ---
    if (authenticate()) {
        fetchProducts();
    }
});