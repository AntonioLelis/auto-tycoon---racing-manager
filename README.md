# 🏎️ Auto Tycoon: Empire Manager

> **Um simulador de gestão automotiva hardcore rodando diretamente no navegador.**

![Status](https://img.shields.io/badge/Status-Beta-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Tech](https://img.shields.io/badge/Built%20With-React%20%7C%20TypeScript%20%7C%20Tailwind-blueviolet?style=flat-square)

## 🌐 Versão Online (Beta)

Jogue a versão hospedada (Beta) aqui: https://auto-tycoon-beta.vercel.app/

O **Auto Tycoon** é um jogo de estratégia e gerenciamento (Tycoon) desenvolvido com **React** e **TypeScript**, focado na complexidade da engenharia automotiva e na gestão empresarial. O jogador assume o papel de CEO de uma nova montadora, desde a garagem de fundo de quintal até se tornar uma lenda global do automobilismo.

---

## 📸 Screenshots

| Dashboard | Engine Lab |
|:---:|:---:|
| *(Adicione um print do Dashboard aqui)* | *(Adicione um print do Editor de Motores aqui)* |

---

## 🎮 Funcionalidades Principais

### 🛠️ Engenharia e Design
* **Editor de Motores:** Projete motores detalhados escolhendo a arquitetura (i4, V6, V8, Boxer), sistema de indução (Turbo, Aspirado) e materiais. Cada escolha afeta Peso, Potência, Torque e Confiabilidade.
* **Design de Carros:** Crie veículos escolhendo entre diversos chassis (Sedan, SUV, Hatchback, Supercar, etc.) e ajuste o foco entre Esportividade, Confiabilidade e Conforto.
* **Visualização Procedural:** Sistema de *Blueprints* em SVG que desenha os esquemas técnicos dos veículos e motores em tempo real baseados nas configurações do jogador.

### 🏭 Gestão Industrial
* **Sistema de Fábrica (PU):** Gerencie a capacidade fabril através de "Production Units". Equilibre a linha de montagem entre carros próprios e contratos externos.
* **Contratos B2B:** Aceite contratos de fornecimento de peças para outras montadoras para manter o fluxo de caixa durante crises.
* **Supply Chain:** Lide com custos de materiais, controle de qualidade e prazos de entrega rigorosos.

### 💼 Economia e Mercado
* **Mercado Dinâmico:** Um sistema de simulação de mercado que avalia seus carros semanalmente baseado em preço, reputação da marca e tendências globais.
* **Sistema Bancário Realista:** Gestão de dívidas com empréstimos escalonados por "Credit Score" (Prestígio). Juros mensais (*Interest-Only*) que punem a má gestão de caixa.
* **Eventos Globais:** Notícias dinâmicas (Crises de Petróleo, Booms Econômicos) que alteram os multiplicadores de demanda e custo.

### 🏁 Automobilismo (End Game)
* **Equipe de Corrida:** Crie sua própria escuderia e participe de campeonatos.
* **Gestão de Pilotos:** Contrate e demita pilotos, gerencie salários e treine habilidades.
* **R&D:** Use as pistas para ganhar pontos de pesquisa e desbloquear novas tecnologias (ABS, Injeção Eletrônica, Fibra de Carbono).

---

## 💻 Tecnologias Utilizadas

Este projeto foi construído focando em **Performance**, **Arquitetura Limpa** e **Zero Dependências de Backend** (Client-side persistence).

* **Frontend:** [React](https://reactjs.org/) (Hooks, Context API).
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/) (Tipagem estrita para lógica financeira e física).
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/) (Design System customizado com tema "Industrial Dark").
* **Ícones:** [Lucide React](https://lucide.dev/).
* **Persistência:** LocalStorage com sistema de Exportação/Importação de Save (JSON) criptografado.

---

## 🚀 Como Rodar Localmente

Siga os passos abaixo para rodar o projeto na sua máquina:

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/SEU-USUARIO/auto-tycoon.git](https://github.com/SEU-USUARIO/auto-tycoon.git)
    ```

2.  **Instale as dependências:**
    ```bash
    cd auto-tycoon
    npm install
    ```

3.  **Rode o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

4.  **Acesse no navegador:**
    Abra `http://localhost:5173` (ou a porta indicada no terminal).

---

## 🤝 Contribuição

Este é um projeto open-source. Sugestões de balanceamento econômico e novas features são bem-vindas! Sinta-se à vontade para abrir uma **Issue** ou enviar um **Pull Request**.

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido por Antonio Augusto de Almeida Lelis.**