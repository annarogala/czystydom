# Czysty Dom 🏠

Aplikacja do zarządzania obowiązkami domowymi związanymi ze sprzątaniem.

**🚀 Wdrożona na Vercel + Upstash Redis** - Zobacz [DEPLOYMENT.md](DEPLOYMENT.md) dla instrukcji

## Wymagania

- Node.js (v18 lub nowszy)
- npm (v10 lub nowszy)
- Konto Upstash Redis (darmowe) - dla wersji produkcyjnej

## Instalacja

```bash
npm install
```

## Konfiguracja

Dla środowiska lokalnego (opcjonalne):
```bash
cp .env.example .env
# Uzupełnij wartości z Upstash Console
```

## Uruchamianie lokalnie

```bash
npm run dev
```

Aplikacja będzie dostępna na http://localhost:4200

## Deployment

Zobacz szczegółowe instrukcje w [DEPLOYMENT.md](DEPLOYMENT.md)

**Szybki start:**
```bash
vercel
```

## Architektura

### Backend (Serverless Functions)
- **Vercel Functions** - bezserwerowe API
- **Upstash Redis** - baza danych w chmurze
- **Endpoints**:
  - `GET /api/todos` - pobiera wszystkie obowiązki
  - `POST /api/todos` - tworzy nowy obowiązek
  - `PUT /api/todos/:id` - aktualizuje obowiązek
  - `DELETE /api/todos/:id` - usuwa obowiązek
  - `PATCH /api/todos/:id/clean` - oznacza obowiązek jako sprzątany

### Frontend
- **Angular 21** - framework aplikacji
- **Signals** - reaktywne zarządzanie stanem
- **HttpClient** - komunikacja z API
- **FormsModule** - obsługa formularzy

## Funkcjonalności

✅ Dodawanie obowiązków domowych z opisem, pomieszczeniem i interwałem  
✅ Lista obowiązków z kolorowymi statusami (ile czasu minęło)  
✅ Oznaczanie obowiązków jako wykonane (zerowanie licznika)  
✅ Edycja istniejących obowiązków  
✅ Usuwanie obowiązków  
✅ Sortowanie według:
  - Czasu od ostatniego sprzątania
  - Alfabetycznie
  - Według pomieszczenia  
✅ Zapisywanie danych w fizycznym pliku JSON  
✅ Synchronizacja między różnymi urządzeniami (przez wspólny plik)

## Struktura projektu

```
czystydom/
├── server/
│   ├── server.js           # Serwer Express API
│   ├── todos.json          # Baza danych (plik JSON)
│   └── todos.json.example  # Przykładowa struktura danych
├── src/
│   └── app/
│       ├── app.ts           # Główny komponent
│       ├── app.html         # Template
│       ├── app.scss         # Style
│       ├── todo.service.ts  # Serwis HTTP
│       └── app.config.ts    # Konfiguracja aplikacji
└── package.json
```

## Współdzielenie danych między komputerami

Plik `server/todos.json` zawiera wszystkie dane aplikacji. Aby synchronizować dane między komputerami:

1. **Opcja 1: Katalog współdzielony** - umieść cały projekt w chmurze (Dropbox, Google Drive, OneDrive)
2. **Opcja 2: Git** - commituj i pushuj plik todos.json do repozytorium (usuń go z .gitignore)
3. **Opcja 3: Serwer sieciowy** - uruchom backend na jednym komputerze w sieci lokalnej i dostosuj URL w `todo.service.ts`

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
