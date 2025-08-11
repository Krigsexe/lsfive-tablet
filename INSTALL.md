# LSFive Tablet - Guide d'Installation Complet

## 1. Introduction
LSFive Tablet est une ressource de tablette moderne et performante pour FiveM, conçue pour être utilisée en véhicule. Développée avec React et TypeScript, elle offre une interface fluide et riche en fonctionnalités, idéale pour les services d'urgence et autres métiers.

### Fonctionnalités
- **Interface Inspirée d'iOS :** Grande, claire et optimisée pour un usage sur tablette.
- **Applications de Base :** Téléphone, Messages, Navigateur, App Store, Réglages (thèmes, fonds d'écran, etc.).
- **Applications Utilitaires :** Banque, Garage, Météo, Mail, Musique, Social, Annuaire des entreprises.
- **Applications Métiers (MDW/MDT) :**
  - **MDT (Police) :** Recherche de citoyens, rapports d'incidents, carte en direct des unités.
  - **MediTab (EMS) :** Gestion des dossiers médicaux.
  - **MechaTab (Mécanos) :** Recherche de véhicules et système de facturation.
- **Système de Prise de Service :** Permet aux joueurs de se mettre en service et de voir leurs collègues sur une carte.

## 2. Prérequis
Cette ressource nécessite les dépendances suivantes pour fonctionner correctement :
- **[ox_lib](https://github.com/overextended/ox_lib)** (Requis pour les notifications et certaines fonctions utilitaires)
- **[oxmysql](https://github.com/overextended/oxmysql)** (Requis pour toutes les interactions avec la base de données)

Assurez-vous d'installer et de démarrer ces ressources **avant** `lsfive-phone`.

## 3. Installation
Suivez ces étapes pour une installation "plug-and-play".

### Étape 1 : Structure des Fichiers
1. Dans votre dossier `resources`, créez un nouveau dossier nommé `lsfive-phone`.
2. À l'intérieur de `lsfive-phone`, créez les dossiers et fichiers suivants :
   ```
   /lsfive-phone
   |-- client/
   |   |-- main.lua
   |-- server/
   |   |-- main.lua
   |-- html/   <-- IMPORTANT
   |-- config.lua
   |-- database.sql
   |-- fxmanifest.lua
   ```
3. **Copiez tous les fichiers de l'interface utilisateur** fournis (tous les fichiers `.tsx`, `.ts`, `.json`, `.html` et les dossiers `components`, `locales`) directement dans le dossier `lsfive-phone/html/`.

### Étape 2 : Remplir les Fichiers de Configuration et Scripts
Copiez le contenu ci-dessous dans les fichiers correspondants que vous venez de créer.

#### `fxmanifest.lua`
```lua
fx_version 'cerulean'
game 'gta5'

author 'Krigs & Gemini'
description 'LSFive - A modern FiveM tablet resource'
version '2.0.0'

ui_page 'html/index.html'

shared_scripts {
    '@ox_lib/init.lua',
    'config.lua'
}

client_scripts {
    'client/main.lua'
}

server_scripts {
    'server/main.lua'
}

files {
    'html/index.html',
    'html/**/*',
}

dependencies {
    'ox_lib',
    'oxmysql'
}

lua54 'yes'
```

#### `config.lua`
```lua
Config = {}

-- [[ GENERAL SETTINGS ]]
Config.Command = 'tablet' 
Config.Keybind = 'F1'
Config.Framework = 'esx' -- 'esx', 'qb-core', 'standalone'
Config.DefaultLanguage = 'fr'
Config.DefaultWallpaper = 'https://i.pinimg.com/originals/8c/f4/98/8cf498ef295f66b4f987405af2d810c3.jpg'
Config.UseOxLibNotifications = true
Config.PhoneNumberFormat = '555-####'
Config.Debug = false

-- [[ JOB-SPECIFIC SETTINGS ]]
-- Define job groups for live map functionality.
-- Users will only see others in the same group.
Config.JobGroups = {
    leo = {'lspd', 'lssd', 'sast', 'fib', 'gouv'},
    ems = {'sams', 'lsfd'},
    mech = {'mechanic', 'bennys'}
}
```

#### `database.sql`
```sql
CREATE TABLE IF NOT EXISTS `phone_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `identifier` varchar(60) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT 'me@ls.mail',
  `job` varchar(50) DEFAULT 'unemployed',
  `onduty` tinyint(1) DEFAULT 0,
  `wallpaper` text DEFAULT NULL,
  `language` varchar(5) DEFAULT 'fr',
  `installed_apps` text DEFAULT '["phone","messages","settings","browser","bank","marketplace","camera","garage","dispatch","businesses","social","music","mail","weather","mdt","meditab","mechatab"]',
  `dock_order` text DEFAULT '["phone","browser","messages","settings"]',
  `settings` text DEFAULT '{"theme":"dark","airplaneMode":false}',
  PRIMARY KEY (`id`),
  UNIQUE KEY `identifier` (`identifier`),
  UNIQUE KEY `phone_number` (`phone_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `phone_contacts` (
  `id` int(11) NOT NULL AUTO_INCREMENT, `owner_identifier` varchar(60) NOT NULL, `name` varchar(255) NOT NULL, `phone_number` varchar(20) NOT NULL, `avatar_url` text,
  PRIMARY KEY (`id`), KEY `owner_identifier` (`owner_identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS `phone_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT, `sender_number` varchar(20) NOT NULL, `receiver_number` varchar(20) NOT NULL, `content` text NOT NULL, `timestamp` timestamp NOT NULL DEFAULT current_timestamp(), `is_read` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`), KEY `sender_number` (`sender_number`), KEY `receiver_number` (`receiver_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS `phone_calls` (
  `id` int(11) NOT NULL AUTO_INCREMENT, `caller_number` varchar(20) NOT NULL, `receiver_number` varchar(20) NOT NULL, `direction` enum('incoming','outgoing','missed') NOT NULL, `timestamp` timestamp NOT NULL DEFAULT current_timestamp(), `is_new` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`), KEY `caller_number` (`caller_number`), KEY `receiver_number` (`receiver_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS `phone_songs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT, `owner_identifier` VARCHAR(60) NOT NULL, `title` VARCHAR(255) NOT NULL, `artist` VARCHAR(255) NOT NULL, `url` TEXT NOT NULL,
  PRIMARY KEY (`id`), INDEX `owner_identifier` (`owner_identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS `phone_mails` (
  `id` INT(11) NOT NULL AUTO_INCREMENT, `owner_identifier` VARCHAR(60) NOT NULL, `sender` VARCHAR(255) NOT NULL, `subject` VARCHAR(255) NOT NULL, `body` TEXT NOT NULL, `is_read` TINYINT(1) NOT NULL DEFAULT 0, `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`), INDEX `owner_identifier` (`owner_identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS `phone_social_posts` (
  `id` INT(11) NOT NULL AUTO_INCREMENT, `author_identifier` VARCHAR(60) NOT NULL, `image_url` TEXT NOT NULL, `caption` TEXT, `likes` INT(11) NOT NULL DEFAULT 0, `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS `phone_dispatch_alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT, `department` varchar(50) NOT NULL, `title` varchar(255) NOT NULL, `details` text NOT NULL, `location` varchar(255) NOT NULL, `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- MDT TABLES
CREATE TABLE `mdt_incidents` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`title` VARCHAR(255) NOT NULL,
	`officers_involved` TEXT NOT NULL,
	`civilians_involved` TEXT NOT NULL,
	`timestamp` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
	PRIMARY KEY (`id`)
) ENGINE=InnoDB;
CREATE TABLE `mdt_reports` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`incident_id` INT(11) NOT NULL,
	`author` VARCHAR(255) NULL DEFAULT NULL,
	`content` TEXT NULL DEFAULT NULL,
	`timestamp` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
	PRIMARY KEY (`id`),
	INDEX `incident_id` (`incident_id`),
	CONSTRAINT `mdt_reports_ibfk_1` FOREIGN KEY (`incident_id`) REFERENCES `mdt_incidents` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- MEDITAB TABLES
CREATE TABLE `medical_records` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`patient_identifier` VARCHAR(50) NOT NULL,
	`doctor` VARCHAR(255) NOT NULL,
	`diagnosis` TEXT NOT NULL,
	`treatment` TEXT NOT NULL,
	`notes` TEXT NULL DEFAULT NULL,
	`timestamp` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
	PRIMARY KEY (`id`),
	INDEX `patient_identifier` (`patient_identifier`)
) ENGINE=InnoDB;

-- MECHATAB TABLES
CREATE TABLE `mechanic_invoices` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`mechanic` VARCHAR(255) NOT NULL,
	`customer_name` VARCHAR(255) NOT NULL,
	`vehicle_plate` VARCHAR(10) NOT NULL,
	`services` TEXT NOT NULL COMMENT 'JSON array of services',
	`total` INT(11) NOT NULL,
	`is_paid` TINYINT(1) NOT NULL DEFAULT '0',
	`timestamp` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
	PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- UPDATE USERS TABLE FOR ESX (Optionnel mais recommandé)
-- ALTER TABLE `users` ADD COLUMN `phone_number` VARCHAR(50) NULL DEFAULT NULL;
```

#### `client/main.lua