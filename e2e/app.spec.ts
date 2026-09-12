import { expect, test, type Page } from '@playwright/test';

const pokemon = {
  id: 25, name: 'pikachu', height: 4, weight: 60, base_experience: 112,
  types: [{ slot: 1, type: { name: 'electric', url: '' } }],
  abilities: [{ ability: { name: 'static', url: '' }, is_hidden: false }],
  stats: [
    ['hp', 35], ['attack', 55], ['defense', 40], ['special-attack', 50], ['special-defense', 50], ['speed', 90],
  ].map(([name, value]) => ({ base_stat: value, stat: { name, url: '' } })),
  sprites: { front_default: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=', other: { dream_world: { front_default: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=' } } },
};

async function mockApi(page: Page) {
  await page.route('https://pokeapi.co/api/v2/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith('/api/v2/type/')) {
      await route.fulfill({ json: { pokemon: Array.from({ length: 10 }, (_, index) => ({ slot: index + 1, pokemon: { name: index === 0 ? 'pikachu' : `pokemon-${index + 1}`, url: `https://pokeapi.co/api/v2/pokemon/${index + 25}/` } })) } }); return;
    }
    if (url.pathname === '/api/v2/pokemon') {
      const offset = Number(url.searchParams.get('offset') ?? 0);
      await route.fulfill({ json: { count: 60, next: offset === 0 ? 'next' : null, results: Array.from({ length: 30 }, (_, index) => ({ name: index === 0 ? 'pikachu' : `pokemon-${offset + index + 1}`, url: `https://pokeapi.co/api/v2/pokemon/${offset + index + 25}/` })) } }); return;
    }
    if (url.pathname.endsWith('/pikachu') || url.pathname.endsWith('/25')) { await route.fulfill({ json: pokemon }); return; }
    await route.fulfill({ status: 404, body: '' });
  });
}

async function login(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Ingresar al Atlas' }).click();
  await expect(page).toHaveURL('/');
}

test.beforeEach(async ({ page }) => { await mockApi(page); await page.goto('/'); await page.evaluate(() => localStorage.clear()); });

test('login → detail remote → persistent history', async ({ page }) => {
  await login(page);
  await expect(page.getByRole('heading', { name: /Explora el mundo/ })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.getByRole('button', { name: 'Ver detalle de pikachu' }).first().click();
  await expect(page).toHaveURL('/pokemon/25');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.getByRole('heading', { name: 'pikachu' })).toBeVisible();
  await page.getByRole('link', { name: 'Historial' }).click();
  await expect(page.getByRole('button', { name: /Abrir pikachu, 1 visitas/ })).toBeVisible();
});

test('toast acknowledgement remains stable until a new visit', async ({ page }) => {
  await login(page); await page.goto('/pokemon/25');
  await expect(page.getByRole('heading', { name: 'pikachu' })).toBeVisible();
  await page.reload(); await expect(page.getByText('Última visita recuperada')).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar notificación' }).click();
  await page.reload(); await expect(page.getByText('Última visita recuperada')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'pikachu' })).toBeVisible();
  await page.goto('/'); await page.getByRole('button', { name: 'Ver detalle de pikachu' }).first().click();
  await expect(page.getByRole('heading', { name: 'pikachu' })).toBeVisible();
  await page.reload(); await expect(page.getByText('Última visita recuperada')).toBeVisible();
});

test('accessible exact search normalizes accents', async ({ page }) => {
  await login(page); await page.getByRole('button', { name: /Buscar Pokémon/ }).click();
  const input = page.getByRole('textbox', { name: 'Nombre exacto del Pokémon' });
  await input.fill('  PÍKACHU  '); await page.getByRole('dialog').getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Ver detalle de pikachu' })).toBeVisible();
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
});
