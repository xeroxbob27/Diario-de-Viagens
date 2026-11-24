# Diário de Viagens

Aplicativo mobile desenvolvido em **React Native com Expo** para a disciplina de **Programação para Dispositivos Móveis I** (Projeto do 2º Bimestre) — **FATEC Franca "Dr. Thomaz Novelino"**.

O **Diário de Viagens** permite registrar lugares que o usuário já visitou ou deseja conhecer, reunindo navegação entre telas, persistência local, geolocalização com mapas interativos, captura e salvamento de fotos na galeria e visualização de estatísticas em gráficos dinâmicos.

---

## Integrantes do Grupo

- **[Guilherme Henrique Lopes]**


---

## Funcionalidades Implementadas

- **Lista de Lugares (`ListaScreen`):** Exibe os locais cadastrados com foto em miniatura, nome, cidade e status (`Quero visitar` / `Visitado`), além de alternância entre visualização **Em Lista** e **1 em 1** (carrossel horizontal).
- **Cadastro e Edição (`CadastroScreen` + `MapaSeletorModal`):** Formulário completo com nome, descrição, rua, número, cidade, estado, status e foto (tirada pela câmera e salva na galeria do dispositivo ou escolhida da galeria). Realiza geocodificação com `Location.geocodeAsync` (bloqueando o cadastro se o endereço não for encontrado) e permite selecionar o endereço diretamente em um mapa interativo.
- **Detalhes do Lugar (`DetalhesScreen`):** Exibe foto, informações completas, mini mapa com marcador, edição do local, alternância de status e remoção com confirmação.
- **Mapa Interativo (`MapaScreen` + `useLocation`):** Obtém a localização atual do usuário pelo hook personalizado `src/hooks/useLocation.js`, exibe marcadores coloridos por status com acesso aos detalhes, busca de locais e opção de tocar no mapa para registrar uma nova viagem.
- **Estatísticas (`EstatisticasScreen`):** Gráficos dinâmicos com `react-native-svg-charts` refletindo os dados cadastrados:
  - Gráfico de Pizza: Lugares por status (`Quero visitar` vs. `Visitado`).
  - Gráfico de Barras: Lugares por cidade.
  - Gráfico de Rosca (Donut): Memórias registradas (com foto vs. sem foto).
- **Persistência Local (`PlacesContext`):** Armazenamento automático dos registros no dispositivo com `@react-native-async-storage/async-storage`.

---

## Estrutura de Pastas

```text
DiarioViagens/
├── src/
│   ├── components/
│   │   └── MapaSeletorModal.js
│   ├── context/
│   │   └── PlacesContext.js
│   ├── hooks/
│   │   └── useLocation.js
│   └── screens/
│       ├── CadastroScreen.js
│       ├── DetalhesScreen.js
│       ├── EstatisticasScreen.js
│       ├── ListaScreen.js
│       └── MapaScreen.js
├── App.js
├── package.json
├── .gitignore
└── README.md
```

---

## Pré-requisitos

- **Node.js** (versão LTS recomendada) e **npm** instalados.
- Aplicativo **Expo Go** instalado no celular (Android ou iOS) **ou** emulador Android/iOS configurado.

---

## Instruções de Instalação e Execução

### 1. Clonar o repositório

```bash
git clone <https://github.com/xeroxbob27/Diario-de-Viagem.git>
cd DiarioViagens
```

### 2. Instalar as dependências

> **Nota importante:** A biblioteca `react-native-svg-charts` declara compatibilidade legada com versões antigas do `react-native-svg`. Por isso, utilize a flag `--legacy-peer-deps` na instalação para evitar erro `ERESOLVE` no npm.

```bash
npm install --legacy-peer-deps
```

#### Referência dos comandos de pacotes utilizados no projeto

Caso seja necessário reinstalar módulos individuais com o Expo CLI:

```bash
npx expo install expo-location react-native-maps -- --legacy-peer-deps
npx expo install expo-image-picker expo-media-library expo-camera -- --legacy-peer-deps
npx expo install react-native-svg -- --legacy-peer-deps
npm install react-native-svg-charts --legacy-peer-deps
npx expo install @react-native-async-storage/async-storage -- --legacy-peer-deps
```

### 3. Iniciar o aplicativo

Inicie o servidor do Expo (recomendado limpar o cache na primeira execução):

```bash
npx expo start -c
```

Ou utilize os scripts definidos no `package.json`:

```bash
npm start           # Inicia o Expo Dev Tools (QR Code para o Expo Go)
npm run android     # Inicia diretamente no emulador/dispositivo Android
npm run ios         # Inicia diretamente no simulador iOS (macOS)
npm run web         # Inicia na versão web
```

### 4. Abrir no dispositivo

1. Escaneie o **QR Code** exibido no terminal usando o aplicativo **Expo Go** (Android) ou a câmera do dispositivo (iOS).
2. Conceda as permissões de **Localização**, **Câmera** e **Galeria** quando solicitadas para utilizar todos os recursos do aplicativo.