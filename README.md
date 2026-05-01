<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Firebase-App%20Hosting-orange?style=for-the-badge&logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/Genkit-AI%20Integration-blue?style=for-the-badge&logo=google-gemini" alt="Genkit" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</div>

<h1 align="center">✂️ HelpBarber</h1>
<p align="center">
  <strong>Gestão Inteligente e Estilo com Inteligência Artificial para Barbearias</strong>
</p>
<p>
<strong>Projeto de Extensão Universitária | USCS - Universidade Municipal de São Caetano do Sul</strong><br>
<strong>Curso:</strong> Análise e Desenvolvimento de Sistemas <br>
<strong>Autor:</strong> Gabriel Perencine Lima
</p>
<p align="center">
  <a href="https://helpbarber--studio-5735207536-45873.us-east4.hosted.app/">Acesse o Site Oficial</a> •
  <a href="#-visão-geral">Visão Geral</a> •
  <a href="#-features">Features</a> •
  <a href="#-tecnologias">Tecnologias</a> •
  <a href="#-como-rodar-localmente">Como Rodar Localmente</a>
</p>

---

## 🚀 Visão Geral

O **HelpBarber** é uma plataforma SaaS (Software as a Service) moderna projetada para revolucionar o ecossistema de barbearias. A solução integra gestão de agendamentos em tempo real, geolocalização e um **Consultor de Estilo baseado em Inteligência Artificial Generativa (Gemini 2.5 Flash)**. O objetivo é proporcionar uma experiência personalizada e fluida para o cliente final, enquanto maximiza a eficiência operacional do barbeiro.

---

## ✨ Features Principais

- 🤖 **Consultor de Estilo com IA:** Análise de formato de rosto e sugestão de cortes usando Google Genkit e Gemini 2.5 Flash.
- 📅 **Agendamento em Tempo Real:** Sistema robusto e reativo para marcação de horários.
- 🗺️ **Geolocalização:** Integração com Google Maps API para exibir barbeiros próximos em um mapa interativo.
- 🛡️ **Painel Administrativo Seguro:** Controle de acessos robusto via Firebase Custom Claims e JWT.
- 📱 **Interface Premium e Responsiva:** Design system baseado em Tailwind CSS, shadcn/ui e animações nativas.
- 🌓 **Dark/Light Mode:** Total suporte a temas, preservando a identidade visual.

---

## 🛠️ Tecnologias

A aplicação foi construída com as tecnologias mais modernas do mercado:

- **Frontend:** Next.js 15.1.7 (App Router), React 18.3.1, TypeScript 5.7.2, Tailwind CSS 3.4.16, shadcn/ui, Framer Motion.
- **Backend & BaaS:** Firebase 11.1.0 (Firestore NoSQL, Authentication, Storage, App Hosting).
- **Inteligência Artificial:** Google Firebase Genkit 1.20.0, Gemini 2.5 Flash.
- **Integrações:** Google Maps JavaScript API (Geocoding & Markers).
- **Qualidade de Código & CI/CD:** ESLint 9.17.0, Prettier 3.3.3, Zod 3.24.1, Jest 29.7.0, React Testing Library 14.3.1, GitHub Actions (Integração Contínua), SonarCloud (Análise Estática e Qualidade).

---

## 🏛️ Arquitetura e Engenharia

O projeto adota o padrão **Model-View-Controller (MVC) adaptado para aplicações React modernas**, garantindo separação de preocupações e escalabilidade:

- **Model (Dados):** Schemas e tipos definidos centralmente (`src/models/types.ts`) validados fortemente com **Zod**.
- **View (Interface):** Componentes atômicos e acessíveis, separados logicamente na pasta `src/components`.
- **Controller (Regras de Negócio):** Hooks customizados do Firebase para abstração e fluxos de IA modulares em `src/ai/flows`.
- **Segurança:** A autenticação e a gestão de papéis utilizam validação rigorosa de *Custom Claims* no contexto global (`FirebaseProvider`), eliminando antigas vulnerabilidades baseadas em `sessionStorage`.

---

## ⚙️ Como Rodar Localmente

Siga o passo a passo abaixo para rodar o projeto em sua máquina:

### 1. Pré-requisitos
- Node.js 18+ instalado.
- Conta no Firebase configurada (Firestore, Storage e Authentication habilitados).
- Chaves de API do Google Maps e do Google AI Studio (Gemini).

### 2. Instalação

```bash
# Clone o repositório
git clone https://github.com/GPerencine/HelpBarber.git
cd HelpBarber

# Instale as dependências (recomendado usar a flag devido a possíveis dependências de UI)
npm install --legacy-peer-deps
```

### 3. Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto com as seguintes configurações:
```env
# Chaves obrigatórias do Firebase
NEXT_PUBLIC_FIREBASE_API_KEY="sua-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="seu-projeto"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="seu-projeto.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="seu-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="seu-app-id"

# Integrações de APIs Externas
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="sua-chave-maps"
GOOGLE_GENAI_API_KEY="sua-chave-gemini"
```

### 4. Executando o Projeto
```bash
# Inicie o servidor de desenvolvimento
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000) no seu navegador para ver o sistema rodando.

### 5. Executando os Testes Automatizados
O projeto conta com uma suíte de testes unitários e de integração implementados com Jest para garantir a integridade das regras de negócio.
```bash
npm run test
```

---

<p align="center">
  Feito com dedicação para inovar a estética masculina através da engenharia de software de ponta. 🚀
</p>
