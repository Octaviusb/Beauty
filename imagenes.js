const fs = require('fs');
const path = require('path');

const dir = './public/images/esmaltes'; // ruta donde están tus imágenes

fs.readdir(dir, (err, files) => {
  if (err) throw err;

  const imagenes = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f));

  imagenes.forEach((file, index) => {
    const ext = path.extname(file);
    const newName = `img${index + 1}${ext}`;
    fs.renameSync(path.join(dir, file), path.join(dir, newName));
    console.log(`✅ ${file} => ${newName}`);
  });
});
