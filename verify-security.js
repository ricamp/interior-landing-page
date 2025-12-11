
const SUPABASE_URL = 'https://rzdsbdqejbqmnbwrfotf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6ZHNiZHFlamJxbW5id3Jmb3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMTExMjMsImV4cCI6MjA4MDg4NzEyM30.z5gTuSR6PQDT0ow3ra1q_wH58L-Oj3Oy_wMEbp6bi_c';

async function verifySecurity() {
    console.log('🛡️ Iniciando Verificação de Segurança (RLS)...');

    const uniqueId = `sec_test_${Date.now()}`;
    const uniqueEmail = `${uniqueId}@test.com`;

    // 1. TENTAR INSERIR (Deve funcionar)
    console.log(`\n1️⃣ Testando INSERT (Permissão Pública)...`);
    try {
        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                name: 'Security Bot',
                email: uniqueEmail,
                phone: '0000000000',
                created_at: new Date().toISOString()
            })
        });

        if (insertRes.status === 201) {
            console.log('✅ INSERT Sucesso (Esperado).');
        } else {
            console.error(`❌ INSERT Falhou: ${insertRes.status} - ${await insertRes.text()}`);
            console.log('⚠️ Se o INSERT falhar, o formulário não funcionará!');
            return;
        }

    } catch (e) {
        console.error('💥 Erro de rede no INSERT:', e);
        return;
    }

    // 2. TENTAR LER O DADO INSERIDO (Deve falhar/retornar vazio se RLS estiver ON)
    console.log(`\n2️⃣ Testando SELECT (Vazamento de Dados)...`);
    try {
        // Tenta buscar pelo email que acabamos de inserir
        const selectRes = await fetch(`${SUPABASE_URL}/rest/v1/waitlist?email=eq.${uniqueEmail}&select=*`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await selectRes.json();
        console.log(`📡 Status: ${selectRes.status}`);

        if (Array.isArray(data)) {
            if (data.length > 0) {
                console.log('❌ FALHA DE SEGURANÇA: O registro inserido foi lido!');
                console.log('⚠️ RLS ainda está DESATIVADO ou mal configurado.');
                console.log('Dados vazados:', data);
            } else {
                console.log('✅ SUCESSO: Registro inserido não foi encontrado (Oculto pelo RLS).');
                console.log('🔒 O banco de dados está SEGURO.');
            }
        } else {
            // Caso retorne erro de permissão (401/403) também é seguro
            if (selectRes.status === 401 || selectRes.status === 403) {
                console.log('✅ SUCESSO: Leitura bloqueada (401/403).');
                console.log('🔒 O banco de dados está SEGURO.');
            } else {
                console.log('ℹ️ Resposta inesperada:', data);
            }
        }

    } catch (e) {
        console.error('💥 Erro de rede no SELECT:', e);
    }
}

verifySecurity();
