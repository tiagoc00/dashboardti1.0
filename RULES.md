# Regras de Arquitetura (Dashboard TI)

Este documento define as regras arquiteturais do projeto baseadas em **SOLID**, **Atomic Design** e **Tailwind CSS**.

## 1. Princípios SOLID no Frontend

*   **S - Single Responsibility Principle (SRP):**
    Cada função, classe ou componente deve ter apenas um motivo para mudar.
    *   *Exemplo:* A lógica de acessar o Firebase (`firebase.service.js`) deve estar separada da lógica de renderizar um gráfico (`chart.service.js`) ou manipular o estado da tela.
*   **O - Open/Closed Principle (OCP):**
    Módulos devem ser abertos para extensão, mas fechados para modificação.
    *   *Exemplo:* Ao adicionar um novo tipo de gráfico, não devemos alterar a função base de gráficos (`ChartFactory`), mas sim criar uma nova configuração/plugin que herde a estrutura.
*   **L - Liskov Substitution Principle (LSP):**
    As abstrações devem poder ser substituídas por suas implementações sem quebrar o sistema. Se um componente espera um "Repository" de dados genérico, ele deve poder receber dados mockados ou reais do Firebase sem saber a diferença.
*   **I - Interface Segregation Principle (ISP):**
    No JavaScript (sem tipagem forte nativa), isso se traduz em não forçar componentes a receberem *props* ou dados massivos (como o array inteiro de estado) se eles só precisam de um ID e um nome. Passe apenas o estritamente necessário.
*   **D - Dependency Inversion Principle (DIP):**
    Componentes de alto nível (UI) não devem depender de detalhes de baixo nível (API do Firebase), mas de abstrações (ex: `AuthService.login()`).

---

## 2. Padrão Atomic Design (Estrutura de Pastas de UI)

Todos os elementos da interface visual devem ser classificados em cinco níveis de complexidade, localizados dentro da pasta `src/components/`:

1.  **Atoms (`/atoms/`)**: Os componentes mais básicos e indivisíveis. (ex: `<Button>`, `<Input>`, `<Badge>`, Icones).
    *   *Regra:* Não possuem lógica de negócio ou dependência de serviços; apenas estilos e eventos simples.
2.  **Molecules (`/molecules/`)**: Grupos de *Atoms* operando em conjunto. (ex: `<SearchField>`, `<KpiCard>`).
    *   *Regra:* Têm funções específicas, mas ainda são genéricos o suficiente para reutilização.
3.  **Organisms (`/organisms/`)**: Grupos de *Molecules* e/ou *Atoms* que formam seções distintas da interface. (ex: `<Sidebar>`, `<ChartSection>`, `<DataTable>`).
    *   *Regra:* Podem lidar com informações locais e acionar métodos de serviço global, orquestrando moléculas.
4.  **Templates (`/templates/`)**: Estruturas de página que definem onde os *Organisms* habitam. O esqueleto visual. (ex: `DashboardTemplate`, `AuthTemplate`).
    *   *Regra:* Delimitam layouts de grid interno, mas não injetam dados diretamente.
5.  **Pages (`/pages/`)**: Instâncias específicas dos *Templates*. (ex: `Dashboard.js`, `Login.js`).
    *   *Regra:* Realizam o carregamento de dados e injetam nos *Organisms* ou *Templates*. Lidam com as Rotas ou estados pai de telas.

---

## 3. Tailwind CSS & Estilização

*   **Sem CSS Personalizado (Custom CSS):** O uso de CSS personalizado (arquivos `.css`) deve ser estritamente **proibido** para layouts comuns, espaçamentos e cores. Tudo deve ser feito através das *utility-classes* do Tailwind.
*   **Exceções CSS:** Arquivos `/src/style.css` devem existir apenas para englobar as diretivas fundamentais do Tailwind (`@apply` ou definições de camadas root persistentes como transições globais complexas que o JIT não consiga ler de forma nativa).
*   **Design Tokens:** A configuração de temas (`tailwind.config.js`) deve ser a fonte da verdade para paleta de cores, tipografia (IBM Plex Mono, Sans) e *border-radius*. Nenhuma cor *hardcoded* (`#FFF` ou `gray-500`) deve ser digitada no JS diretamente e sim referenciada utilizando a nomenclatura definida de sistema.

---

## 4. Diretrizes Gerais de Código

1.  **Arquivos Modulares (`ES Modules`):** Todo o JavaScript criado deve estar modularizado. Em vez de criar instâncias globais como `var window.__FB`, exporte/importe instâncias isoladas (ex: `import { getAuth } from './services/firebase'`).
2.  **Linting e Padronização:** Certifique-se de configurar um `.prettierrc` ou as regras de base do `.eslintrc` para forçar padronização (aspas simples/duplas e indentação).
3.  **Segurança (Data Handling):** Renderização de HTML em dinâmicos na UI precisa passar por métodos de _escape_ HTML simples para evitar manipulação de XSS, similar ao formato estrito atual implementado.

*Este arquivo é o guia definitivo a ser lido antes do aceite de Pull Requests e novas implementações.*
