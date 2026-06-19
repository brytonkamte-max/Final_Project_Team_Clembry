<div align="center">

<div align="center">
  <img src="public/img/logo-img.png" alt="iClembryLearning Logo" width="180" onerror="this.src='https://raw.githubusercontent.com/brytonkamte-max/Final_Project_Team_Clembry/main/public/img/logo-img.png'; this.onerror=null;"/>
</div>

# iClembryLearning

### Piattaforma E-Learning ed Hub di Connessione per Tutoring Online

*Mettiti in contatto con i migliori docenti, pianifica le tue lezioni e monitora il tuo percorso accademico in tempo reale.*

<br/>

[![Angular](https://img.shields.io/badge/Angular-17+-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![RxJS](https://img.shields.io/badge/RxJS-7.x-B7178C?style=for-the-badge&logo=reactivex&logoColor=white)](https://rxjs.dev/)

<br/>

[Introduzione](#-introduzione) •
[Tech Stack](#-tech-stack) •
[Funzionalità](#-funzionalità) •
[Database](#-architettura-del-database) •
[Avvio Rapido](#-configurazione-e-avvio-in-locale) •
[API](#-principali-endpoint-api) •
[Autori](#-autori)

</div>

---

## 📖 Introduzione

**iClembryLearning** è un'applicazione web ed ecosistema didattico disaccoppiato, concepito per connettere studenti ed esperti dell'insegnamento per ripetizioni e corsi mirati. L'obiettivo principale del progetto è snellire e digitalizzare l'intero flusso di apprendimento: dalla ricerca di un docente specifico tramite un sistema di filtraggio avanzato e reattivo, fino all'iscrizione e alla visualizzazione dei corsi pianificati.

Il **backend** gestisce l'integrità referenziale dei dati e la persistenza tramite MySQL. Include un sistema automatizzato di inizializzazione e caricamento dati fittizi (*seeding*), che garantisce un ambiente di test pronto all'uso fin dal primo avvio.

Il **frontend**, d'altra parte, sfrutta le più recenti innovazioni dell'architettura a componenti di Angular, offrendo un'interfaccia asincrona basata sullo stato reattivo e ottimizzata contro i falsi positivi visivi.

---

## 🛠️ Tech Stack

| Livello | Tecnologia | Ruolo |
|---|---|---|
| **Backend Framework** | Express.js (v4.x) | Sviluppo delle RESTful API e routing |
| **Linguaggio Backend** | Node.js | Runtime JavaScript lato server |
| **Database Primario** | MySQL (v8.0) | Persistenza delle relazioni e dei dati utente |
| **Database Driver** | `mysql2/promise` | Gestione delle query asincrone tramite moduli nativi |
| **Frontend Framework** | Angular (v17+) | SPA (Single Page Application) basata su componenti standalone |
| **State Management** | Angular Signals | Gestione dello stato reattiva e calcolata in tempo reale |
| **Asincronia Client** | RxJS & HttpClient | Pipeline per la gestione delle chiamate asincrone HTTP |
| **Stile & Design** | CSS3 Custom | UI con Design System proprietario Dark/Neon |

---

## ✨ Funzionalità

### 🔒 Gestione Utenti & Autenticazione
- Registrazione di nuovi profili con assegnazione dei ruoli (`student` o `teacher`)
- Controllo di unicità a livello database per indirizzi email e username
- Sistema di login sicuro con persistenza e recupero dei dati dell'utente corrente

### 📚 Esplorazione e Ricerca Corsi
- Ricerca testuale e filtri per singola materia, calcolati in tempo reale tramite Angular `computed` signals
- Pulsante per il reset rapido dei filtri, per favorire un'esperienza utente fluida

### ✍️ Iscrizioni Asincrone Protette
- Controllo preventivo integrato nello stato del client, per impedire iscrizioni duplicate allo stesso corso
- Meccanismo di callback di rete per l'invio asincrono: i messaggi di conferma visivi appaiono soltanto quando il database risponde con l'esito reale `201 Created`

### 📅 Gestione per i Docenti
- Estensione delle tabelle anagrafiche per includere tariffe orarie, bio, avatar personali e materie gestite in formato stringato JSON

---

## 🗄️ Architettura del Database

Il database MySQL è composto da **4 entità core** collegate tramite vincoli di integrità referenziale:

```
┌────────────────────────────────────┐
│               users                │
│────────────────────────────────────│
│  id (PK)                           │
│  nome, cognome                     │
│  username     UNIQUE               │
│  email        UNIQUE               │
│  password, role                    │
└────────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┐
        │ 1:1             1:N│
        ▼                   ▼
┌──────────────────────┐  ┌──────────────────────────┐
│       teachers        │  │          courses          │
│────────────────────────│  │────────────────────────────│
│  id (PK)               │  │  id (PK)                  │
│  user_id (FK→users.id) │  │  titolo, descrizione      │
│  titolo, bio           │  │  materia, prezzo, dataOra │
│  tariffaOraria         │  │  immagine                 │
│  materie (JSON string) │  │  teacher_id (FK→teachers) │
│  avatar                │  │                            │
└────────────────────────┘  └──────────────┬─────────────┘
                                            │ 1:N
                                            ▼
                              ┌──────────────────────────┐
                              │      subscriptions        │
                              │   (Junction Table)         │
                              │────────────────────────────│
                              │  id (PK)                  │
                              │  user_id    (FK→users.id) │
                              │  course_id  (FK→courses)  │
                              │  subscriptionData         │
                              └────────────────────────────┘
```

| Tabella | Descrizione |
|---|---|
| `users` | Anagrafica base di ogni account, con ruolo `student` o `teacher` |
| `teachers` | Estensione 1:1 di `users`, contiene i dati professionali del docente |
| `courses` | Catalogo dei corsi, ciascuno collegato a un docente |
| `subscriptions` | Tabella ponte N:N tra `users` e `courses`, traccia le iscrizioni |

---

## 📁 Struttura del Progetto

```
progettofinale/
│
├── backend/                          # Backend — Node.js & Express
│   ├── database/
│   │   ├── init.js                   # Script DDL per la creazione delle tabelle
│   │   └── seed.js                   # Script DML per il caricamento dei dati di prova
│   ├── db.js                         # Connessione al pool MySQL2 con promesse
│   ├── server.js                     # Punto di ingresso, middleware CORS e rotte API
│   ├── .env.example                  # Template per variabili d'ambiente
│   └── package.json
│
└── frontend/                         # Frontend — Angular Standalone
    ├── src/app/
    │   ├── core/
    │   │   ├── services/              # Servizi API (Auth, Courses, Subscription)
    │   │   └── models/                # Modelli e interfacce TypeScript (Subscription, ecc.)
    │   ├── features/
    │   │   ├── courses/                # Componente catalogo corsi con filtri Signals
    │   │   └── come-funziona/          # Guida all'utilizzo ed accordion interattivo FAQ
    │   └── app.routes.ts               # Routing centralizzato dell'applicazione
    └── package.json
```

---

## 🚀 Configurazione e Avvio in Locale

### Prerequisiti
- [Node.js](https://nodejs.org/) (Versione LTS v18+)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) installato ed in esecuzione

### 1. Configurazione del Backend

```bash
# Naviga nella cartella dedicata
cd backend

# Installa le dipendenze di Node
npm install
```

Configura le variabili d'ambiente creando un file `.env` (puoi partire da `.env.example`):

```env
DB_HOST=localhost
DB_USER=il_tuo_utente
DB_PASSWORD=la_tua_password
DB_NAME=iclembry_db
```

Avvia il server. Al primo avvio verranno autogenerate le tabelle e caricati i dati di mock:

```bash
npm start
```

> Il backend risponderà su: **http://localhost:8080**

### 2. Configurazione del Frontend

Apri una nuova finestra del terminale e spostati sul client:

```bash
cd frontend

# Installa i pacchetti necessari
npm install

# Esegui il server di sviluppo locale
ng serve
```

> Visita l'applicazione sul tuo browser preferito: **http://localhost:4200**

---

## 🧩 Pattern Architetturali e di Design

### Client-Side Reactivity (Angular Signals)

I filtri per materia e per testo digitato sono gestiti tramite atomi di stato isolati (`signal`). I risultati filtrati a schermo fanno uso del pattern **Computed Signal**, calcolando le combinazioni in modo memorizzato (*memoized*) e aggiornando il DOM esclusivamente se i criteri di filtro cambiano realmente — riducendo drasticamente i cicli di computazione.

```typescript
// Pattern computato per l'ottimizzazione dei filtri
corsiFiltrati = computed(() => {
  const lista = this.listaCorsi();
  const filtroMateria = this.materiaSelezionata();
  const testo = this.ricercaNome().toLowerCase().trim();

  return lista.filter(corso => {
    const matchMateria = filtroMateria ? corso.materia === filtroMateria : true;
    const matchTesto = testo ? corso.titolo.toLowerCase().includes(testo) : true;
    return matchMateria && matchTesto;
  });
});
```

### Pattern Asincrono Callback-Driven

Per scongiurare disallineamenti dello stato e l'apparizione di avvisi visivi di iscrizione andata a buon fine in presenza di errori interni del database (come fallimenti di chiavi esterne), il metodo del componente delega l'alert a dei callback espliciti (`onSuccess` / `onError`), risolti unicamente al completamento della chiamata asincrona di `HttpClient`.

---

## 🔌 Principali Endpoint API

| Metodo | Endpoint | Descrizione |
|---|---|---|
| `GET` | `/api/users` | Recupera tutti gli utenti registrati |
| `POST` | `/api/auth/register` | Registrazione utente (Student / Teacher) |
| `POST` | `/api/auth/login` | Verifica credenziali d'accesso |
| `GET` | `/api/teachers` | Elenco completo dei docenti e dettagli utente |
| `POST` | `/api/teachers` | Creazione del profilo esteso docente |
| `GET` | `/api/courses` | Elenco corsi completi di dati del docente |
| `POST` | `/api/courses` | Creazione nuovo corso a catalogo |
| `GET` | `/api/subscriptions/:userId` | Recupera le iscrizioni attive di uno studente |
| `POST` | `/api/subscriptions` | Invia una nuova iscrizione al database |

---

## 👥 Autori

| Nome | GitHub |
|---|---|
| Bryton Junior | [@brytonkamte-max](https://github.com/brytonkamte-max) |
| Emanuele Zeppa | [@Emanuele2325](https://github.com/Emanuele2325) |

---

<div align="center">

<sub>Realizzato con ❤️ come progetto finale del percorso di sviluppo web full-stack</sub>

</div>
