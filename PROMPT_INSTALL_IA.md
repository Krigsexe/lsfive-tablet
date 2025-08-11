
# Prompt pour Agent IA : Transformation en Ressource FiveM "Plug-and-Play" (Version Tablette)

**Rôle :** Agis en tant qu'ingénieur expert en développement FiveM et architecte de solutions logicielles. Tu es spécialisé dans l'intégration de technologies web (React, TypeScript) au sein de l'environnement Lua de FiveM. Ta mission est de garantir une expérience utilisateur finale fluide, de la restructuration du code à l'installation.

**Mission Principale :** Transformer l'application React autonome fournie en une ressource FiveM **Tablette** complète, prête pour la production et "plug-and-play". Le résultat final doit être un dossier unique que n'importe quel propriétaire de serveur FiveM peut télécharger, configurer minimalement et lancer sans aucune modification de code.

**Contexte et Fichiers Fournis :**
Tu recevras un ensemble de fichiers représentant une application de tablette autonome développée en React/TypeScript. Un fichier crucial, `FIVEM.md`, contient tout le code backend (Lua) et la structure de la base de données (SQL) nécessaires pour la version tablette.

Les fichiers fournis incluent :
*   `index.tsx`, `App.tsx`, `types.ts`, `constants.ts`, etc. (fichiers de l'interface utilisateur React)
*   **Les applications métiers :** `MdtApp.tsx`, `MediTab.tsx`, `MechaTab.tsx`.
*   `html/`, `components/`, `locales/` (dossiers de l'interface utilisateur)
*   `FIVEM.md` (contient le code source pour `fxmanifest.lua`, `config.lua`, `client/main.lua`, `server/main.lua`, et `database.sql`)
*   `metadata.json`
*   `README.md` (une version de base à améliorer)

**Instructions Détaillées - Plan d'Action :**

**Étape 1 : Créer la Structure de Dossier de la Ressource**
Crée une nouvelle structure de dossier racine pour la ressource, nommée `lsfive-phone`. À l'intérieur de ce dossier, crée la structure suivante :
```
/lsfive-phone
|-- client/
|-- server/
|-- html/
|-- config.lua
|-- database.sql
|-- fxmanifest.lua
|-- README.md
```

**Étape 2 : Analyser `FIVEM.md` et Créer les Fichiers de Base**
Analyse le fichier `FIVEM.md`. Utilise le contenu de chaque section désignée pour créer et remplir les fichiers suivants à l'emplacement correct :

1.  **`lsfive-phone/fxmanifest.lua`** : Utilise le code de la section `fxmanifest.lua`.
2.  **`lsfive-phone/config.lua`** : Utilise le code de la section `config.lua`.
3.  **`lsfive-phone/database.sql`** : Utilise le code de la section `database.sql`.
4.  **`lsfive-phone/client/main.lua`** : Utilise le code de la section `client/main.lua`.
5.  **`lsfive-phone/server/main.lua`** : Utilise le code de la section `server/main.lua`.

**Étape 3 : Relocaliser les Fichiers de l'Interface Utilisateur (UI)**
Déplace **tous** les fichiers et dossiers de l'application React existante dans le nouveau dossier `lsfive-phone/html/`. Cela inclut :
*   `index.html` -> `lsfive-phone/html/index.html`
*   `index.tsx` -> `lsfive-phone/html/index.tsx`
*   `App.tsx` -> `lsfive-phone/html/App.tsx`
*   `types.ts` -> `lsfive-phone/html/types.ts`
*   `constants.ts` -> `lsfive-phone/html/constants.ts`
*   `nui.ts` -> `lsfive-phone/html/nui.ts`
*   `i18n.ts` -> `lsfive-phone/html/i18n.ts`
*   Le dossier `components/` et tout son contenu -> `lsfive-phone/html/components/` (y compris `MdtApp.tsx`, `MediTab.tsx`, `MechaTab.tsx`).
*   Le dossier `locales/` et tout son contenu -> `lsfive-phone/html/locales/`
*   **Action Clé :** Supprime les fichiers et dossiers dupliqués ou mal placés de l'ancienne structure. La structure finale ne doit contenir que `lsfive-phone` en tant que dossier racine.

**Étape 4 : Vérifier la Cohérence et l'Intégration**
1.  **Vérification du Manifeste :** Confirme que le `fxmanifest.lua` pointe correctly vers `html/index.html` (`ui_page 'html/index.html'`).
2.  **Vérification NUI :** Compare les `RegisterNUICallback` dans `client/main.lua` avec les appels `fetchNui('eventName', ...)` dans les fichiers `.tsx`. Assure-toi que chaque événement, y compris ceux des applications métiers (`mdt:searchCitizens`, `phone:setDuty`, etc.), a un gestionnaire correspondant dans la logique Lua.
3.  **Vérification de la Base de Données :** Assure-toi que `database.sql` contient les tables `mdt_incidents`, `medical_records`, et `mechanic_invoices` nécessaires pour les applications métiers.

**Étape 5 : Générer une Documentation `README.md` de Haute Qualité**
Remplace le `README.md` existant par une version améliorée, claire et professionnelle, destinée à un utilisateur non-développeur, en se concentrant sur la version **Tablette**. Il doit inclure :

*   **Introduction :** Décrire la ressource comme une tablette pour véhicules, idéale pour les métiers.
*   **Fonctionnalités :** Lister toutes les fonctionnalités, en mettant en avant les applications métiers (MDT, MediTab, MechaTab) et le système de service / carte en direct.
*   **Dépendances Requises :** `ox_lib` et `oxmysql` avec leurs liens GitHub.
*   **Instructions d'Installation Claires :**
    1.  Télécharger les dépendances et `lsfive-phone`.
    2.  Placer les dossiers dans `resources`.
    3.  Importer `database.sql`.
    4.  Configurer `config.lua` (expliquer `Config.Framework` et `Config.JobGroups`).
    5.  Assurer le bon ordre de démarrage dans `server.cfg`.
*   **Intégration au Framework :** Expliquer l'importance de modifier `server/main.lua` pour les fonctionnalités métiers.

**Étape 6 : Produire le Résultat Final**
Présente le résultat final sous la forme d'une arborescence de fichiers complète pour le dossier `lsfive-phone`, avec le contenu intégral de chaque fichier nouvellement créé ou déplacé. Assure-toi que tous les chemins sont corrects par rapport au nouveau dossier racine `lsfive-phone`.

**Critères de Succès :**
*   L'ensemble du projet est contenu dans un seul dossier racine `lsfive-phone`.
*   Le `README.md` est optimisé pour la version Tablette et est suffisamment clair pour une installation facile.
*   La ressource est fonctionnellement cohérente : les scripts Lua incluent la logique pour toutes les fonctionnalités de la tablette, y compris les applications métiers.
