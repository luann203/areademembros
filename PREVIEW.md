# Como acessar no preview

## Servidor rodando

Depois de `npm run dev`, aguarde aparecer **✓ Ready** no terminal.

## Abrir no preview (Cursor / VS Code)

1. Abra o **Simple Browser** / Preview (Command Palette → “Simple Browser: Show” ou atalho do preview).
2. Na barra de endereço do preview, digite: **`http://localhost:3003`**
3. Ou use a porta que aparecer no terminal (ex.: `http://localhost:3000` se for 3000).

## URLs

| Onde           | URL |
|----------------|-----|
| **Preview**    | **http://localhost:3003** |
| Página inicial | http://localhost:3003 (redireciona para login) |
| Login          | http://localhost:3003/login |
| Dashboard      | http://localhost:3003/dashboard (após login) |

Se o Next.js estiver em outra porta (3000, 3001, 3002…), use essa porta no lugar de 3003.

## Credenciais

- **Qualquer email** + senha: **`1234567`**  
  Ex.: `aluno@example.com` / `1234567`

## Porta fixa (opcional)

Para forçar a porta 3003:

```bash
PORT=3003 npm run dev
```

Depois abra no preview: **http://localhost:3003**

---

**Importante:** o servidor precisa estar rodando (`npm run dev`) para acessar a aplicação.
