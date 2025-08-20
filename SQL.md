# LSFive Tablet - Schéma de la Base de Données

Exécutez ce script SQL sur la base de données de votre serveur FiveM pour créer toutes les tables nécessaires au bon fonctionnement de la ressource LSFive Tablet.

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
ALTER TABLE `users` ADD COLUMN `phone_number` VARCHAR(50) NULL DEFAULT NULL;

```
```

</changes>
```
