INSERT INTO `site_pages` (`title`, `slug`, `status`, `show_in_menu`, `banner_title`, `banner_description`, `sections`, `meta_title`, `meta_description`)
SELECT 'Hotels', '/hotels', 'published', true, 'Hotels in Makkah and Madinah', 'Explore our recommended hotels by city and visit each hotel website for more details and booking information.', '[]', 'Hotels in Makkah and Madinah | British Hajj Travel', 'Browse recommended hotels in Makkah and Madinah with direct links to each hotel website.'
WHERE NOT EXISTS (SELECT 1 FROM `site_pages` WHERE `slug` = '/hotels');
