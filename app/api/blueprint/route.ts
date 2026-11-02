import { createBlueprint, inputSchema } from '@/lib/blueprint';

const headers = { 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' };
const json = (data: unknown, status = 200) => Response.json(data,{status,headers});
export async function POST(request: Request) {
  // Reject cross-origin browser writes; this endpoint never stores inputs.
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return json({error:'Please generate your blueprint from this website.'},403);
  if (!request.headers.get('content-type')?.includes('application/json')) return json({error:'Expected a JSON request.'},415);
  // Bound the actual streamed body, not only the caller-controlled Content-Length.
  const reader = request.body?.getReader();
  if (!reader) return json({error:'Your project details are missing.'},400);
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const {done,value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) { await reader.cancel(); return json({error:'Please keep your project details under 8 KB.'},413); }
      chunks.push(value);
    }
    const body = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { body.set(chunk,offset); offset += chunk.byteLength; }
    const parsed = inputSchema.safeParse(JSON.parse(new TextDecoder().decode(body)));
    if (!parsed.success) return json({error:'Check your project details and try again.',fields:parsed.error.flatten().fieldErrors},422);
    return json({blueprint:createBlueprint(parsed.data)});
  } catch {
    return json({error:'We could not read these project details. Please try again.'},400);
  } finally { reader.releaseLock(); }
}
