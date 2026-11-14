# 🦷 Simulado de Semiologia Bucal & Diagnóstico de Lesões Orais

Aplicação interativa de treinamento e gamificação propedêutica voltada para estudantes de Odontologia em preparação para a prova prática projetiva de **Semiologia e Estomatologia**.

---

## ✨ Funcionalidades Principais

- 🔀 **Ordem 100% Aleatória dos Casos:** Embaralhamento completo via algoritmo Fisher-Yates a cada ciclo e botão dedicado para reembaralhar a qualquer instante.
- 📋 **Ficha Semiológica Oficial da Cátedra:**
  1. *Morfologia & Inspeção Visual:* Lesão Fundamental, Base de Inserção (Séssil / Pediculada), Superfície (Lisa, Irregular, Verrugosa), Limites e Coloração.
  2. *Topografia & Lateralidade:* Sítio Anatômico exato e Lateralidade (Direita, Esquerda, Linha Média, Bilateral).
  3. *Palpação & Sensação ao Toque:* Consistência propedêutica (Macia, Flutuante, Firme/Fibroelástica, Endurecida/Óssea).
  4. *Hipótese Diagnóstica:* Validação instantânea com motor de sinônimos clínicos tolerante a acentuação e variações terminológicas.
- 📚 **Guia Clínico de Patologias Integrado:**
  - Material de apoio com critérios de desempate para as principais "batalhas" da prova (Tríade reacional da gengiva, lesões brancas, úlceras, nódulos salivares, manchas escuras).
  - Fichas rápidas com o *"Pulo do Gato"* e alertas de erros crassos para todas as 28 patologias.
  - Botão *"💡 Como raciocinar neste caso?"* diretamente no bloco de diagnóstico.
- 🎨 **Design Tátil "Duolingo Vibes":**
  - Paleta terrosa quente e elegante: *Espresso (`#29221F`), Chocolate (`#49352E`), Umber (`#795344`), Terracota (`#A46F54`), Areia (`#C5A889`), Linho (`#D9C9B5`), Marfim (`#EAE1D5`), Oliva (`#69715B`) e Argila (`#A64F42`)*.
  - Botões com chanfro 3D táteis, feedback sonoro e visual, lupa microscópica e inversor de eixo da peça projetada.
- ⭐ **Deck de Revisão Personalizado:** Salve casos que causaram dúvida para retreinar isoladamente antes da prova.

---

## 🚀 Como Executar Localmente

Não requer instalação de dependências externas (apenas HTML, CSS e JavaScript puros):

```bash
# Clone o repositório
git clone https://github.com/RayNoAlc/simulado-semio.git

# Acesse o diretório
cd simulado-semio

# Inicie um servidor local simples
python -m http.server 8080
```

Abra no navegador em `http://localhost:8080/`.

---

## 📖 Material Teórico de Apoio

Consulte o arquivo [`GUIA_PRATICO_HIPOTESE_DIAGNOSTICA.md`](GUIA_PRATICO_HIPOTESE_DIAGNOSTICA.md) para o resumo esquemático das patologias e fluxogramas de raciocínio clínico.
