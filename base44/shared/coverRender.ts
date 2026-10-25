// Renders an article cover card to JPEG bytes (Deno backend functions).
import { initWasm, Resvg } from 'npm:@resvg/resvg-wasm@2.6.2';
import jpeg from 'npm:jpeg-js@0.4.4';
import { buildCoverSvg } from './coverCard.ts';
import { LOGO_DATA_URI } from './coverLogo.ts';

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@resvg/resvg-wasm@2.6.2/index_bg.wasm';
const FONT_URLS = [
  'https://cdn.jsdelivr.net/gh/rsms/inter@v3.19/docs/font-files/Inter-Bold.otf',
  'https://cdn.jsdelivr.net/gh/rsms/inter@v3.19/docs/font-files/Inter-SemiBold.otf',
];

let ready: Promise<Uint8Array[]> | null = null;

async function fetchBytes(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

function prepare(): Promise<Uint8Array[]> {
  if (!ready) {
    ready = (async () => {
      await initWasm(fetch(WASM_URL));
      return Promise.all(FONT_URLS.map(fetchBytes));
    })().catch((e) => { ready = null; throw e; });
  }
  return ready;
}

export async function renderCoverJpeg({ title, categoryName }: { title: string; categoryName?: string }): Promise<Uint8Array> {
  const fonts = await prepare();
  const svg = buildCoverSvg({ title, categoryName, logoDataUri: LOGO_DATA_URI });
  const rendered = new Resvg(svg, {
    font: { fontBuffers: fonts, defaultFontFamily: 'Inter', loadSystemFonts: false },
    fitTo: { mode: 'original' },
  }).render();
  const { width, height } = rendered;
  const encoded = jpeg.encode({ data: rendered.pixels, width, height }, 84);
  rendered.free?.();
  return new Uint8Array(encoded.data);
}
