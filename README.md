# LSFive Tablet - Tablette FiveM Universelle

[![Visitors Badge](https://api.visitorbadge.io/api/VisitorHit?user=Krigsexe&repo=lsfive-tablet&countColor=%237B1E7A)](https://github.com/Krigsexe/lsfive-tablet)

**[DEMO LIVE](https://lsfive-krigs-tabs-550776260716.us-west1.run.app)**

## Introduction

LSFive Tablet est une ressource de tablette **moderne, universelle et plug & play** pour FiveM. Concue avec React 18 et TypeScript, elle offre une interface fluide de type iOS, optimisee pour tous les metiers (police, EMS, mecaniciens) et compatible avec **tous les frameworks** (ESX, QBCore, Standalone).

### Caracteristiques

- **Interface iOS-like** : Design moderne avec dock, dossiers, et widgets
- **Detection automatique du framework** : ESX, QBCore ou Standalone
- **26+ Applications** integrees et fonctionnelles
- **Applications Metiers MDW/MDT** :
  - **MDT (Police)** : Recherche de citoyens, incidents, carte en direct
  - **MediTab (EMS)** : Dossiers medicaux patients
  - **MechaTab (Mecaniciens)** : Recherche vehicules et facturation
- **Integration lsfive-phone** : Synchronisation contacts, messages, notifications
- **Systeme de prise de service** avec carte en temps reel
- **Multi-langue** : Francais et Anglais inclus
- **Entierement personnalisable** via config.lua

## Compatibilite Technique (Decembre 2025)

| Composant | Version |
|-----------|---------|
| FiveM Runtime | Node.js 16.9.1 (Node 22 optionnel) |
| fx_version | cerulean |
| React | 18.3.x |
| Vite | 4.5.x |
| TypeScript | 5.5.x |
| Base de donnees | MariaDB (recommande) / MySQL 8+ |

## Dependances Requises (CommunityOx)

| Ressource | Version | Description |
|-----------|---------|-------------|
| [ox_lib](https://github.com/overextended/ox_lib) | v3.32+ | Notifications et utilitaires |
| [oxmysql](https://github.com/overextended/oxmysql) | v2.13+ | Acces base de donnees |

> Note: Overextended a ete archive en avril 2025. Les ressources restent fonctionnelles et maintenues par la communaute.

## Installation Rapide (Plug & Play)

### Etape 1 : Telecharger et Placer

```
resources/
  [standalone]/
    lsfive-tablet/
      client/
        main.lua
      server/
        main.lua
      shared/
        functions.lua
      html/
        index.html
        ... (fichiers UI compiles)
      locales/
        en.json
        fr.json
      config.lua
      fxmanifest.lua
      install.sql
      uninstall.sql
```

### Etape 2 : Importer la Base de Donnees

```bash
# Via ligne de commande
mysql -u root -p votre_database < install.sql

# Ou via phpMyAdmin/HeidiSQL
# Importez le fichier install.sql
```

### Etape 3 : Configuration

Editez `config.lua` selon vos besoins :

```lua
Config.Framework = 'auto'     -- 'auto', 'esx', 'qbcore', 'standalone'
Config.Command = 'tablet'     -- Commande chat
Config.Keybind = 'F2'         -- Touche clavier
Config.DefaultLanguage = 'fr' -- 'fr' ou 'en'

-- Integration telephone
Config.PhoneIntegration = {
    enabled = true,
    resourceName = 'lsfive-phone',
    syncContacts = true,
    syncMessages = true,
    crossNotifications = true,
}
```

### Etape 4 : Demarrer

Ajoutez a votre `server.cfg` :

```cfg
# Dependances (obligatoires)
ensure ox_lib
ensure oxmysql

# Framework (un seul)
ensure es_extended  # OU qb-core

# Ressources LSFive (optionnel: phone avant tablet)
ensure lsfive-phone
ensure lsfive-tablet
```

## Configuration Avancee

### Groupes de Metiers

Definissez quels jobs ont acces aux applications specifiques :

```lua
Config.JobGroups = {
    leo = {'police', 'lspd', 'lssd', 'fib', 'bcso', 'sheriff'},
    ems = {'ambulance', 'sams', 'lsfd', 'medic'},
    mechanic = {'mechanic', 'bennys', 'lscustoms', 'pdm'},
    government = {'gouv', 'mayor', 'judge', 'lawyer'}
}
```

### Applications Disponibles

| Application | Description | Acces |
|-------------|-------------|-------|
| Phone | Appels et contacts | Tous |
| Messages | SMS | Tous |
| Browser | Navigateur web | Tous |
| Bank | Solde et virements | Tous |
| Garage | Gestion vehicules | Tous |
| Dispatch | Alertes urgence | Tous |
| Weather | Meteo en direct | Tous |
| Music | Lecteur YouTube | Tous |
| Social | Reseau social | Tous |
| Mail | Emails | Tous |
| Camera | Capture d'ecran | Tous |
| Marketplace | App Store | Tous |
| Businesses | Annuaire | Tous |
| MDT | Terminal police | LEO |
| MediTab | Dossiers medicaux | EMS |
| MechaTab | Factures mecano | Mechanic |

### Systeme Vocal

Compatible avec pma-voice et mumble-voip pour les appels :

```lua
Config.VoiceSystem = 'auto'        -- 'auto', 'pma-voice', 'mumble-voip', 'none'
Config.EnableVoiceCalls = true
```

## Exports Disponibles

### Client

```lua
-- Ouvrir/Fermer la tablette
exports['lsfive-tablet']:openTablet()
exports['lsfive-tablet']:closeTablet()
exports['lsfive-tablet']:toggleTablet()
exports['lsfive-tablet']:isTabletOpen()
```

### Server

```lua
-- Informations joueur
exports['lsfive-tablet']:GetPlayerIdentifier(source)
exports['lsfive-tablet']:GetPlayerJob(source)
exports['lsfive-tablet']:GetPlayerPhoneNumber(source)
exports['lsfive-tablet']:GetPlayerName(source)
exports['lsfive-tablet']:GetPlayerBankBalance(source)

-- Notifications et dispatch
exports['lsfive-tablet']:SendNotification(source, title, message, type)
exports['lsfive-tablet']:SendDispatchAlert(department, title, details, location, coords)

-- Synchronisation telephone
exports['lsfive-tablet']:SyncWithPhone(source)
```

## Integration avec lsfive-phone

Cette tablette est concue pour fonctionner en coherence avec [lsfive-phone](https://github.com/Krigsexe/lsfive-phone). Les deux ressources partagent :

- Architecture similaire (React 18 + TypeScript + Lua)
- Meme systeme de detection de framework
- Tables de base de donnees compatibles
- Synchronisation bidirectionnelle des donnees
- Notifications croisees (message sur phone = notif sur tablet)

### Configuration de la synchronisation

```lua
Config.PhoneIntegration = {
    enabled = true,                  -- Activer l'integration
    resourceName = 'lsfive-phone',   -- Nom de la ressource phone
    syncContacts = true,             -- Sync contacts
    syncMessages = true,             -- Sync messages
    syncCallHistory = true,          -- Sync historique appels
    sharePhoneNumber = true,         -- Meme numero de telephone
    crossNotifications = true,       -- Notifications croisees
}
```

## Structure du Projet

```
lsfive-tablet/
├── fxmanifest.lua          # Manifest FiveM (fx_version cerulean)
├── config.lua              # Configuration complete
├── install.sql             # Schema base de donnees
├── uninstall.sql           # Suppression des tables
├── package.json            # Dependencies Node.js (React 18, Vite 4.5)
├── vite.config.ts          # Configuration build
├── tailwind.config.js      # Configuration Tailwind CSS
├── postcss.config.cjs      # Configuration PostCSS
├── client/
│   └── main.lua            # Logique client (NUI, animations, 50+ callbacks)
├── server/
│   └── main.lua            # Logique serveur (DB, events, exports)
├── shared/
│   └── functions.lua       # Fonctions partagees (framework, phone integration)
├── html/
│   ├── index.html          # Point d'entree NUI
│   ├── App.tsx             # Application React principale
│   ├── nui.ts              # Bridge NUI <-> Lua
│   ├── types.ts            # TypeScript interfaces
│   └── components/         # 87 composants React
│       ├── apps/           # 25+ applications
│       └── shell/          # UI systeme
└── locales/
    ├── en.json             # Traductions anglais
    └── fr.json             # Traductions francais
```

## Developpement

### Prerequis

- Node.js 16.9.1+ (ou Node 22 avec `node_version '22'` dans fxmanifest)
- npm ou pnpm

### Build

```bash
# Installation des dependances
npm install

# Build pour production
npm run build

# Mode developpement (hot reload)
npm run dev
```

### Ajouter une langue

1. Copiez `locales/en.json` vers `locales/xx.json`
2. Traduisez les valeurs
3. Ajoutez dans `config.lua`:

```lua
Config.SupportedLanguages = {
    { code = 'fr', name = 'Francais' },
    { code = 'en', name = 'English' },
    { code = 'xx', name = 'Votre Langue' }
}
```

## FAQ

**Q: La tablette ne s'ouvre pas ?**
- Verifiez que ox_lib et oxmysql sont demarres avant lsfive-tablet
- Verifiez la console F8 pour les erreurs
- Assurez-vous que les fichiers HTML sont compiles (dossier html/assets)

**Q: Les donnees ne se chargent pas ?**
- Assurez-vous d'avoir execute install.sql
- Verifiez la connexion oxmysql dans server.cfg
- Activez `Config.Debug = true` pour voir les erreurs

**Q: Comment changer la touche ?**
- Modifiez `Config.Keybind` dans config.lua
- Ou utilisez `/tablet` en chat

**Q: Compatible avec mon framework custom ?**
- Utilisez `Config.Framework = 'standalone'`
- Adaptez les fonctions dans shared/functions.lua

**Q: Comment desinstaller proprement ?**
- Executez `uninstall.sql` dans votre base de donnees
- Supprimez le dossier lsfive-tablet

## Contribution

Les contributions sont les bienvenues ! N'hesitez pas a :
- Signaler des bugs via les Issues
- Proposer des ameliorations via Pull Request
- Ajouter des traductions

---

**Stars, Forks & Contributions Welcome!**

![Profile Views](https://komarev.com/ghpvc/?username=Krigsexe&color=blueviolet&style=for-the-badge)
![GitHub Stars](https://img.shields.io/github/stars/Krigsexe?style=for-the-badge&logo=github)

---

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=footer&text=Thank%20you%20for%20visiting!&fontSize=16&fontAlignY=65&desc=Merci%20pour%20votre%20visite!&descAlignY=80&descAlign=62"/>
</div>
