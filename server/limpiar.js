// Ejecuta esto una vez en tu servidor para limpiar registros problemáticos
const db = require('./db');
db.exec(`
  DELETE FROM products 
  WHERE image IS NULL 
  OR image = ''
  OR image = 'undefined'
`);