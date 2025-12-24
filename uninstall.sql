-- =====================================================
-- LSFIVE TABLET - UNINSTALL SCRIPT
-- =====================================================
-- WARNING: This script will DELETE ALL tablet data!
-- Make sure to backup your database before running this.
-- =====================================================

-- Drop job-specific tables first (due to potential foreign keys)
DROP TABLE IF EXISTS `tablet_mechanic_invoices`;
DROP TABLE IF EXISTS `tablet_medical_records`;
DROP TABLE IF EXISTS `tablet_mdt_warrants`;
DROP TABLE IF EXISTS `tablet_mdt_bolos`;
DROP TABLE IF EXISTS `tablet_mdt_reports`;
DROP TABLE IF EXISTS `tablet_mdt_incidents`;

-- Drop main tables
DROP TABLE IF EXISTS `tablet_businesses`;
DROP TABLE IF EXISTS `tablet_dispatch`;
DROP TABLE IF EXISTS `tablet_social_likes`;
DROP TABLE IF EXISTS `tablet_social`;
DROP TABLE IF EXISTS `tablet_mails`;
DROP TABLE IF EXISTS `tablet_songs`;
DROP TABLE IF EXISTS `tablet_transactions`;
DROP TABLE IF EXISTS `tablet_calls`;
DROP TABLE IF EXISTS `tablet_messages`;
DROP TABLE IF EXISTS `tablet_contacts`;
DROP TABLE IF EXISTS `tablet_users`;

-- =====================================================
-- NOTES
-- =====================================================
-- If you want to keep player data but remove job tables:
-- Comment out the "main tables" section above.
--
-- To reinstall, run install.sql after this script.
-- =====================================================
