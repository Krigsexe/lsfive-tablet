# LSFive Tablet - Tablette FiveM Moderne et Universelle

[![Visitors Badge](https://api.visitorbadge.io/api/VisitorHit?user=Krigsexe&repo=lsfive-tablet&countColor=%237B1E7A)](https://github.com/Krigsexe/lsfive-tablet)

[DEMO](https://lsfive-krigs-tabs-550776260716.us-west1.run.app)

![Tablet Mockup](https://www.proxitek.fr/wp-content/uploads/2025/08/fivem-tablet.png)

## Introduction

LSFive Tablet est une ressource de tablette **moderne, universelle et plug & play** pour FiveM. Conue avec React et TypeScript, elle offre une interface fluide de type iOS, optimisee pour tous les metiers (police, EMS, mecaniciens) et compatible avec **tous les frameworks** (ESX, QBCore, Standalone).

### Caracteristiques

- **Interface iOS-like** : Design moderne avec dock, dossiers, et widgets
- **Detection automatique du framework** : ESX, QBCore ou Standalone
- **26+ Applications** integrees et fonctionnelles
- **Applications Metiers MDW/MDT** :
  - **MDT (Police)** : Recherche de citoyens, incidents, carte en direct
  - **MediTab (EMS)** : Dossiers medicaux patients
  - **MechaTab (Mecaniciens)** : Recherche vehicules et facturation
- **Systeme de prise de service** avec carte en temps reel
- **Multi-langue** : Francais et Anglais inclus
- **Entierement personnalisable** via config.lua

## Dependances Requises

| Ressource | Description |
|-----------|-------------|
| [ox_lib](https://github.com/overextended/ox_lib) | Notifications et utilitaires |
| [oxmysql](https://github.com/overextended/oxmysql) | Acces base de donnees |

## Installation Rapide (Plug & Play)

### Etape 1 : Telecharger et Placer

```
resources/
  lsfive-tablet/
    client/
      main.lua
    server/
      main.lua
    shared/
      functions.lua
    html/
      index.html
      ... (fichiers UI)
    locales/
      en.json
      fr.json
    config.lua
    fxmanifest.lua
    install.sql
```

### Etape 2 : Importer la Base de Donnees

Executez le fichier `install.sql` dans votre base de donnees MySQL.

### Etape 3 : Configuration

Editez `config.lua` selon vos besoins :

```lua
Config.Framework = 'auto'     -- 'auto', 'esx', 'qbcore', 'standalone'
Config.Command = 'tablet'     -- Commande chat
Config.Keybind = 'F2'         -- Touche clavier
Config.DefaultLanguage = 'fr' -- 'fr' ou 'en'
```

### Etape 4 : Demarrer

Ajoutez a votre `server.cfg` :

```cfg
ensure ox_lib
ensure oxmysql
ensure es_extended  # ou qb-core selon votre framework
ensure lsfive-tablet
```

## Configuration Avancee

### Groupes de Metiers

Definissez quels jobs ont acces aux applications specifiques :

```lua
Config.JobGroups = {
    leo = {'police', 'lspd', 'lssd', 'fib', 'gouv'},
    ems = {'ambulance', 'sams', 'lsfd'},
    mechanic = {'mechanic', 'bennys', 'lscustoms'}
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
exports['lsfive-tablet']:openTablet()
exports['lsfive-tablet']:closeTablet()
exports['lsfive-tablet']:isTabletOpen()
exports['lsfive-tablet']:toggleTablet()
```

### Server

```lua
exports['lsfive-tablet']:GetPlayerIdentifier(source)
exports['lsfive-tablet']:GetPlayerJob(source)
exports['lsfive-tablet']:GetPlayerPhoneNumber(source)
exports['lsfive-tablet']:SendNotification(source, title, message, type)
exports['lsfive-tablet']:SendDispatchAlert(department, title, details, location, coords)
```

## Integration avec lsfive-phone

Cette tablette est conue pour fonctionner en coherence avec [lsfive-phone](https://github.com/Krigsexe/lsfive-phone). Les deux ressources partagent :

- Architecture similaire (React + TypeScript + Lua)
- Meme systeme de detection de framework
- Tables de base de donnees compatibles
- Memes exports et conventions

## Structure du Projet

```
lsfive-tablet/
├── fxmanifest.lua          # Manifest FiveM
├── config.lua              # Configuration
├── install.sql             # Schema base de donnees
├── client/
│   └── main.lua            # Logique client (NUI, animations)
├── server/
│   └── main.lua            # Logique serveur (DB, events)
├── shared/
│   └── functions.lua       # Fonctions partagees
├── html/
│   ├── index.html          # Point d'entree NUI
│   ├── App.tsx             # Application React principale
│   ├── nui.ts              # Bridge NUI <-> Lua
│   └── components/         # Composants React
└── locales/
    ├── en.json             # Traductions anglais
    └── fr.json             # Traductions francais
```

## FAQ

**Q: La tablette ne s'ouvre pas ?**
- Verifiez que ox_lib et oxmysql sont demarres avant lsfive-tablet
- Verifiez la console F8 pour les erreurs

**Q: Les donnees ne se chargent pas ?**
- Assurez-vous d'avoir execute install.sql
- Verifiez la connexion oxmysql

**Q: Comment changer la touche ?**
- Modifiez `Config.Keybind` dans config.lua
- Ou utilisez `/tablet` en chat

**Q: Compatible avec mon framework custom ?**
- Utilisez `Config.Framework = 'standalone'` et adaptez les fonctions dans shared/functions.lua

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
