
const SUPABASE_URL = 'https://rzdsbdqejbqmnbwrfotf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6ZHNiZHFlamJxbW5id3Jmb3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMTExMjMsImV4cCI6MjA4MDg4NzEyM30.z5gTuSR6PQDT0ow3ra1q_wH58L-Oj3Oy_wMEbp6bi_c';

async function testRead() {
    console.log('🕵️ Verificando vazamento de dados (READ access)...');

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/waitlist?select=*&limit=5`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
        });

        const status = response.status;
        const text = await response.text();

        console.log(`📡 Status: ${status}`);

        if (status === 200) {
            console.log('⚠️ ALERTA CRÍTICO: Dados expostos! A role "anon" tem permissão de SELECT.');
            console.log('📦 Dados (Amostra):', text.substring(0, 200) + '...');
        } else if (status === 401 || status === 403) {
            console.log('✅ SEGURO: Leitura bloqueada para anônimos.');
        } else {
            console.log(`ℹ️ Resposta inesperada: ${status}`);
            console.log(text);
        }

    } catch (err) {
        console.error('💥 Erro de rede:', err);
    }
}

testRead();
