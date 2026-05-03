-- EXECUTE ESTE COMANDO NO "SQL EDITOR" DO SEU DASHBOARD SUPABASE PARA TORNAR AS OBRAS VISÍVEIS
-- Isto permitirá que visitantes anónimos vejam as obras, mas NÃO as possam editar.

-- 1. Ativar RLS na tabela de obras (se ainda não estiver)
ALTER TABLE obras ENABLE ROW LEVEL SECURITY;

-- 2. Criar política para permitir leitura pública (SELECT)
CREATE POLICY "Permitir leitura pública de obras" 
ON obras FOR SELECT 
TO anon 
USING (true);

-- 3. Garantir que o bucket de storage também é público para leitura
-- (Vá a Storage > Buckets > obras > Policies e garanta que "Public" está ativo para operações de SELECT)
