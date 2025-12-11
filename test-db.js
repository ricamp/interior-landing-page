
const SUPABASE_URL = 'https://rzdsbdqejbqmnbwrfotf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6ZHNiZHFlamJxbW5id3Jmb3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMTExMjMsImV4cCI6MjA4MDg4NzEyM30.z5gTuSR6PQDT0ow3ra1q_wH58L-Oj3Oy_wMEbp6bi_c';

async function testInsert() {
    console.log('🔄 Diagnóstico Supabase (Secure Check)...');

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                name: 'Secure Check Script',
                email: `secure_check_${Date.now()}@test.com`,
                phone: '11988887777',
                created_at: new Date().toISOString()
            })
        });

        const status = response.status;
        const text = await response.text();

        console.log(`📡 Status: ${status}`);
        console.log(`📦 Body: ${text}`);

        if (status === 201) {
            console.log('✅ SUCESSO! Inserção aceita.');
        } else {
            console.log('❌ FALHA! Permissão negada.');
            if (text.includes('policy')) console.log('👉 MOTIVO: Política RLS bloqueando.');
            if (text.includes('permission denied')) console.log('👉 MOTIVO: Falta GRANT (Permissão básica).');
        }
    } catch (err) {
        console.error('💥 Erro de rede:', err);
    }
}

testInsert();
