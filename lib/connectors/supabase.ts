import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase connector.
 *
 * ClawdPress is backend-light by default — most brands need nothing
 * here. When a brand DOES need a contact form, newsletter signup,
 * gated content, or a light product catalogue, Supabase is the
 * recommended escape hatch:
 *
 *   - Forms: insert submissions into a `submissions` table via the
 *     anon key + row-level security policies (safe to expose client-side)
 *   - Auth: Supabase Auth for gated/member content
 *   - Light ecommerce: a `products` table + Stripe via Supabase
 *     Edge Functions for checkout
 *
 * The exported HTML stays static — forms POST to Supabase directly
 * via a small inline script ClawdPress generates per form block,
 * so no server runtime is required to host the site itself.
 */

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  if (!client) client = createClient(url, anonKey);
  return client;
}

export function isSupabaseConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

/**
 * Generates the inline form markup + script for a contact-form block
 * that submits directly to a Supabase table from static HTML output.
 *
 * Expects a `submissions` table with RLS allowing inserts from anon:
 *
 *   create table submissions (
 *     id uuid primary key default gen_random_uuid(),
 *     form_id text not null,
 *     data jsonb not null,
 *     created_at timestamptz default now()
 *   );
 *   alter table submissions enable row level security;
 *   create policy "Allow anon inserts" on submissions
 *     for insert to anon with check (true);
 */
export function generateSupabaseFormHTML(formId: string, fields: { name: string; label: string; type?: string }[]): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const inputs = fields
    .map(
      f => `      <label>
        ${f.label}
        <input type="${f.type || 'text'}" name="${f.name}" required>
      </label>`
    )
    .join('\n');

  return `  <section class="block-form" aria-label="Contact form">
    <form id="${formId}" data-clawdpress-form>
${inputs}
      <button type="submit" class="btn btn-primary">Submit</button>
      <p class="form-status" role="status" aria-live="polite"></p>
    </form>
  </section>
  <script>
    (function () {
      var form = document.getElementById(${JSON.stringify(formId)});
      if (!form) return;
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        var status = form.querySelector('.form-status');
        var data = Object.fromEntries(new FormData(form).entries());
        try {
          var res = await fetch(${JSON.stringify(`${supabaseUrl}/rest/v1/submissions`)}, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': ${JSON.stringify(anonKey)},
              'Authorization': 'Bearer ' + ${JSON.stringify(anonKey)},
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ form_id: ${JSON.stringify(formId)}, data: data })
          });
          status.textContent = res.ok ? 'Thanks \u2014 your message has been sent.' : 'Something went wrong. Please try again.';
        } catch (err) {
          status.textContent = 'Something went wrong. Please try again.';
        }
      });
    })();
  </script>`;
}
