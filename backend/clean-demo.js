/**
 * clean-demo.js
 * Elimina SOLO los datos de demostración (usuarios demo y el contenido
 * que generaron), conservando:
 *   - Cuentas reales (admin, y cualquier usuario registrado "de verdad")
 *   - Perfiles académicos reales y las fichas que les pertenecen
 *   - Catálogo de roles, permisos, programas y fichas sin usuarios
 *
 * Uso:  node clean-demo.js
 */
const mysql = require('mysql2/promise');

const DB = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USERNAME || 'elyron',
  password: process.env.DB_PASSWORD || 'elyron123',
  database: process.env.DB_NAME || 'elyron_db',
};

// Cuentas creadas por el seed (seed.ts). El admin se conserva.
const DEMO_EMAILS = [
  'vocero@elyron.com',
  'university@prueba.com',
  'estudiante@elyron.com',
  'bienestar@elyron.com',
  'rector@elyron.com',
  'coordinador@elyron.com',
  'aprendiz@elyron.com',
  'instructor@elyron.com',
  'orientador@elyron.com',
  'personero@elyron.com',
  'docente@elyron.com',
  'convivencia@elyron.com',
  'colider@elyron.com',
];

// Tablas cuyo contenido fue 100% sembrado como demo (sin datos reales).
const SEED_ONLY_TABLES = [
  'recursos_biblioteca',
  'ofertas_trabajo',
  'llamadas',
  'publicaciones_comunidad',
  'eventos_calendario',
  'anuncios_comunidad',
  'actividades_docente',
  'entregas_docente',
  'competencias',
  'resultados',
  'evidencias',
  'comentarios_publicacion',
  'likes_publicaciones',
  'reportes_moderacion',
  'reportes_publicacion',
  'remisiones',
  'remisiones_colegio',
  'comunicados',
  'ficha_anuncios',
  'ficha_inquietudes',
  'solicitudes',
  'documentos_personales',
  'notificaciones',
  'ficha_instructores',
  'docentes_grupos',
  'mensajes_chat',
  'casos',
  'casos_mensajes',
  'casos_historial',
  'casos_categorias',
  'elir_conversaciones',
  'elir_mensajes',
  'elir_documentos',
  'elir_planes',
  'elir_uso',
];

async function main() {
  const conn = await mysql.createConnection(DB);
  const demoIds = [];
  for (const email of DEMO_EMAILS) {
    const [rows] = await conn.query('SELECT id FROM usuarios WHERE email = ?', [
      email,
    ]);
    if (rows.length) demoIds.push(rows[0].id);
  }
  console.log(`Cuentas demo a eliminar: ${demoIds.length}`);

  const [fichaRows] = await conn.query(
    'SELECT id FROM fichas WHERE code = ?',
    ['2957489'],
  );
  const demoFichaId = fichaRows[0]?.id ?? null;
  const [grupoRows] = await conn.query('SELECT id FROM grupos WHERE code = ?', [
    '10-02',
  ]);
  const demoGrupoId = grupoRows[0]?.id ?? null;
  console.log(
    `Ficha demo: ${demoFichaId ?? 'ninguna'} | Grupo demo: ${demoGrupoId ?? 'ninguno'}`,
  );

  await conn.query('SET FOREIGN_KEY_CHECKS = 0');

  // 1) Contenido 100% demo
  for (const table of SEED_ONLY_TABLES) {
    const [r] = await conn.query(`DELETE FROM ${table}`);
    console.log(`  vaciada: ${table} (${r.affectedRows})`);
  }

  // 2) Contenido referenciado por usuarios demo (por si quedara algo)
  if (demoIds.length) {
    const userRefTables = {
      perfiles_sena: 'usuarioId',
      perfiles_colegio: 'usuarioId',
      perfiles_universidad: 'usuarioId',
      password_reset_tokens: 'userId',
    };
    for (const [table, col] of Object.entries(userRefTables)) {
      const [r] = await conn.query(
        `DELETE FROM ${table} WHERE ${col} IN (?)`,
        [demoIds],
      );
      if (r.affectedRows > 0)
        console.log(`  limpiado refs demo en: ${table} (${r.affectedRows})`);
    }
    const [au] = await conn.query(
      'DELETE FROM log_auditoria WHERE actor IN (?)',
      [DEMO_EMAILS.concat(demoIds)],
    );
    if (au.affectedRows > 0)
      console.log(`  limpiado auditoria demo (${au.affectedRows})`);
  }

  // 3) Ficha y grupo demo
  if (demoFichaId) {
    const [r] = await conn.query('DELETE FROM fichas WHERE id = ?', [
      demoFichaId,
    ]);
    console.log(`  eliminada ficha demo (${r.affectedRows})`);
  }
  if (demoGrupoId) {
    const [r] = await conn.query('DELETE FROM grupos WHERE id = ?', [
      demoGrupoId,
    ]);
    console.log(`  eliminado grupo demo (${r.affectedRows})`);
  }

  // 4) Usuarios demo (nunca toca admin ni cuentas reales)
  if (demoIds.length) {
    const [r] = await conn.query('DELETE FROM usuarios WHERE id IN (?)', [
      demoIds,
    ]);
    console.log(`  eliminados usuarios demo (${r.affectedRows})`);
  }

  await conn.query('SET FOREIGN_KEY_CHECKS = 1');

  // Verificación final
  const [users] = await conn.query(
    'SELECT email FROM usuarios ORDER BY email',
  );
  console.log('\n=== Usuarios restantes (se conservan) ===');
  users.forEach((u) => console.log(' -', u.email));

  await conn.end();
  console.log('\nLimpieza demo completada.');
}

main().catch((e) => {
  console.error('Error durante la limpieza:', e);
  process.exit(1);
});
