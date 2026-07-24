# Conexões Atlânticas · Constelação Acadêmica

Visualização interativa de trabalhos acadêmicos sobre história da Bahia e diáspora africana.

## 🚀 Começando

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint

# Testes
npm run test
```

## 🏗️ Arquitetura

- **ES Modules** — código modularizado
- **D3 v7** — renderização do grafo
- **Tailwind CSS** — estilização utilitária
- **Store Pattern** — estado centralizado
- **DOM API** — sem innerHTML (seguro contra XSS)

## 📁 Estrutura

```
src/
├── config/        # Constantes e tokens
├── data/          # Repositório de dados
├── graph/         # Renderizador D3
├── state/         # Store centralizado
├── ui/            # Componentes de UI
└── utils/         # Utilitários
```

## 🔒 Segurança

- Sanitização de HTML via `textContent`
- Escape automático de strings
- Sem `eval()` ou `innerHTML` com dados dinâmicos
