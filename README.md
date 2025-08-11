# LSFive Tablet - Une Ressource de Tablette Moderne pour FiveM

[![Visitors Badge](https://api.visitorbadge.io/api/VisitorHit?user=Krigsexe&repo=lsfive-tablet&countColor=%237B1E7A)](https://github.com/Krigsexe/lsfive-tablet)

![Tablet Mockup](https://www.proxitek.fr/wp-content/uploads/2025/08/fivem-tablet.png)

LSFive Tablet est une ressource de tablette moderne, riche en fonctionnalités et optimisée pour la performance sur FiveM, construite avec React et TypeScript. Conçue pour une utilisation en véhicule par les services d'urgence et autres métiers, elle est prête à l'emploi tout en offrant des possibilités de personnalisation approfondies pour n'importe quel framework (ESX, QBCore, ou standalone).

## Fonctionnalités

*   **Interface Utilisateur Grand Format :** Une interface propre et intuitive inspirée d'iOS, optimisée pour un affichage sur tablette.
*   **Applications de Base :** Téléphone, Messages, Réglages, Navigateur.
*   **Applications Fonctionnelles :** Banque, Garage, Entreprises, Mail, Social, Musique, Météo.
*   **Applications Métiers Avancées :**
    *   **MDT/CAD :** Pour les forces de l'ordre (LSPD, LSSD, etc.), avec recherche de citoyens, création de rapports d'incidents et carte en direct.
    *   **MediTab :** Pour les services médicaux (SAMS, LSFD), avec gestion des dossiers médicaux des patients.
    *   **MechaTab :** Pour les mécaniciens, avec recherche de véhicules et système de facturation.
*   **Système de Service :** Permet aux employés de se mettre en service/hors service et de voir les unités actives sur une carte en direct (séparées par groupe de métier).
*   **Personnalisation Poussée :**
    *   Thèmes clair/sombre.
    *   Fonds d'écran personnalisés via URL ou upload.
    *   Installation/désinstallation d'applications via l'App Store.
    *   **Layout Modulable :** Glissez-déposez les icônes pour organiser votre écran d'accueil et le dock.
*   **Performance et Localisation :**
    *   Code optimisé pour un impact minimal sur les performances.
    *   Support complet pour l'Anglais et le Français. L'ajout de nouvelles langues est simple.

## Dépendances Requises

*   [ox_lib](https://github.com/overextended/ox_lib) : Requis pour ses librairies et son système de notifications.
*   [oxmysql](https://github.com/overextended/oxmysql) : Requis pour toutes les interactions avec la base de données.

## Installation

1.  **Télécharger :** Clonez ou téléchargez cette ressource (`lsfive-phone`) et placez-la dans votre dossier `resources`.
2.  **Base de Données :** Importez le fichier `database.sql` dans la base de données de votre serveur. Cela créera toutes les tables nécessaires.
3.  **Configuration :** Ouvrez `config.lua` et ajustez les paramètres. **Le paramètre `Config.Framework` est crucial** et doit correspondre à votre serveur ('esx', 'qb-core', ou 'standalone').
4.  **Démarrage (`server.cfg`) :** Assurez-vous que la ressource est démarrée **après** votre framework et les dépendances. L'ordre est important.
    ```cfg
    ensure ox_lib
    ensure oxmysql
    ensure es_extended # ou qb-core
    ensure lsfive-phone
    ```

## Intégration au Framework

Pour que la tablette fonctionne avec les données de votre serveur (argent, véhicules, identifiants de joueur), vous **devez** éditer la section `FRAMEWORK INTEGRATION` en haut du fichier `server/main.lua`. Des exemples pour ESX et QBCore sont fournis.

**Exemple (`GetPlayerFromSource`):**
```lua
-- server/main.lua

function GetPlayerFromSource(source)
    if Config.Framework == 'esx' then
        return exports.esx:GetPlayerFromId(source)
    elseif Config.Framework == 'qb-core' then
        return exports['qb-core']:GetPlayer(source)
    -- ...
    end
end
```
Vous devrez également implémenter la logique pour les transferts bancaires, la sortie de véhicules, etc., dans les callbacks NUI correspondants dans `server/main.lua` en utilisant les fonctions de votre framework.

---

*Cette tablette a été développée par Krigs et améliorée pour une intégration plug-and-play par Gemini AI.*

---

**⭐ Stars, 🍴 Forks & 🤝 Contributions Welcome!**

![Profile Views](https://komarev.com/ghpvc/?username=Krigsexe&color=blueviolet&style=for-the-badge)
![GitHub Stars](https://img.shields.io/github/stars/Krigsexe?style=for-the-badge&logo=github)

</div>

---

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=footer&text=Thank%20you%20for%20visiting!&fontSize=16&fontAlignY=65&desc=Merci%20pour%20votre%20visite!&descAlignY=80&descAlign=62"/>
</div>
