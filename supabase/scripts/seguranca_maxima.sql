-- EXECUTE ESTE COMANDO PARA GARANTIR SEGURANÇA MÁXIMA
-- Este script garante que APENAS o email definido como admin pode ver/editar dados sensíveis.

-- 1. Definir uma política restrita para Obras
DROP POLICY IF EXISTS "obras_auth_write" ON obras;
CREATE POLICY "obras_admin_all" ON obras 
FOR ALL USING (auth.jwt() ->> 'email' = 'atelier.anaalexandre@gmail.com');

-- 2. Definir uma política restrita para Contactos (Leitura/Edição)
DROP POLICY IF EXISTS "contactos_auth_read" ON contactos;
DROP POLICY IF EXISTS "contactos_auth_update" ON contactos;
CREATE POLICY "contactos_admin_select" ON contactos 
FOR SELECT USING (auth.jwt() ->> 'email' = 'atelier.anaalexandre@gmail.com');
CREATE POLICY "contactos_admin_update" ON contactos 
FOR UPDATE USING (auth.jwt() ->> 'email' = 'atelier.anaalexandre@gmail.com');
CREATE POLICY "contactos_admin_delete" ON contactos 
FOR DELETE USING (auth.jwt() ->> 'email' = 'atelier.anaalexandre@gmail.com');

-- 3. Definir uma política restrita para Vendas (Leitura)
DROP POLICY IF EXISTS "vendas_read_auth" ON vendas;
CREATE POLICY "vendas_admin_select" ON vendas 
FOR SELECT USING (auth.jwt() ->> 'email' = 'atelier.anaalexandre@gmail.com');
CREATE POLICY "vendas_admin_update" ON vendas 
FOR UPDATE USING (auth.jwt() ->> 'email' = 'atelier.anaalexandre@gmail.com');

-- 4. Definir uma política restrita para Newsletter
DROP POLICY IF EXISTS "newsletter_auth_read" ON newsletter;
CREATE POLICY "newsletter_admin_select" ON newsletter 
FOR SELECT USING (auth.jwt() ->> 'email' = 'atelier.anaalexandre@gmail.com');

-- 5. Definir uma política restrita para Configurações
DROP POLICY IF EXISTS "config_auth_write" ON config_site;
CREATE POLICY "config_admin_all" ON config_site 
FOR ALL USING (auth.jwt() ->> 'email' = 'atelier.anaalexandre@gmail.com');

-- NOTA IMPORTANTE: 
-- No Dashboard do Supabase (Authentication > Settings), deves garantir que:
-- A opção "Confirm Email" está ATIVA para evitar que alguém use o teu email sem acesso à tua caixa de entrada.
