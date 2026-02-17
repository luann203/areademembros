# 🎯 Como Acessar no Preview

## ✅ Servidor está rodando!

O servidor Next.js está iniciando. Aguarde alguns segundos até ver "✓ Ready" no terminal.

## 🌐 Acesse no Navegador

1. **Abra seu navegador** (Chrome, Firefox, Safari, Edge)
2. **Digite na barra de endereço**: `http://localhost:3000`
3. Você será redirecionado para a página de login

## 📍 URLs Importantes

- **Página inicial**: `http://localhost:3000` → redireciona para login
- **Login**: `http://localhost:3000/login`
- **Dashboard**: `http://localhost:3000/dashboard` (após login)

## 🔑 Credenciais

- **Aluno**: `aluno@example.com` / `aluno123`
- **Admin**: `admin@example.com` / `admin123`

## ⚠️ Se não aparecer

### Verifique a porta:
O servidor pode estar em outra porta. Veja no terminal qual porta está sendo usada:
- Procure por: `- Local: http://localhost:XXXX`

### Se estiver em outra porta:
- Se for porta 3001: acesse `http://localhost:3001`
- Se for porta 3002: acesse `http://localhost:3002`

### Ou force a porta 3000:
```bash
# Pare o servidor (Ctrl+C)
# Execute:
PORT=3000 npm run dev
```

## 🆘 Problemas Comuns

1. **"Cannot GET /"**: Aguarde mais alguns segundos, o servidor ainda está compilando
2. **Página em branco**: Limpe o cache do navegador (Ctrl+Shift+R ou Cmd+Shift+R)
3. **404 Not Found**: Verifique se o servidor está rodando e qual porta está usando

## 📝 Nota sobre Preview do Cursor/VSCode

Se você está usando o preview interno do Cursor/VSCode:
- O preview pode não funcionar corretamente com Next.js
- **Recomendação**: Use um navegador externo (Chrome, Firefox, etc.)
- Acesse diretamente: `http://localhost:3000`

---

**Lembre-se**: O servidor precisa estar rodando (`npm run dev`) para acessar a aplicação!
