DROP DATABASE IF EXISTS employeedb;

CREATE DATABASE employeedb;

DROP TABLE IF EXISTS `departments`;

CREATE TABLE `departments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(30) DEFAULT NULL,
  UNIQUE KEY `id` (`id`)
);

DROP TABLE IF EXISTS `roles`;

CREATE TABLE `roles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(30)  NOT NULL,
  `salary` decimal(10,0) NOT NULL,
  `department_id` int unsigned NOT NULL,
  UNIQUE KEY `id` (`id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `roles_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`)
);

DROP TABLE IF EXISTS `employees`;

CREATE TABLE `employees` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `first_name` varchar(30)  NOT NULL,
  `last_name` varchar(30)  NOT NULL,
  `role_id` int unsigned NOT NULL,
  `manager_id` int unsigned DEFAULT NULL,
  UNIQUE KEY `id` (`id`),
  KEY `role_id` (`role_id`),
  KEY `manager_id` (`manager_id`),
  CONSTRAINT `employees_ibfk_3` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `employees_ibfk_4` FOREIGN KEY (`manager_id`) REFERENCES `employees` (`id`)
);

INSERT INTO `departments` (`id`, `name`) VALUES
(69, 'Sales');
INSERT INTO `departments` (`id`, `name`) VALUES
(70, 'Development');
INSERT INTO `departments` (`id`, `name`) VALUES
(71, 'Finance');
INSERT INTO `departments` (`id`, `name`) VALUES
(72, 'Legal');

INSERT INTO `roles` (`id`, `name`, `salary`, `department_id`) VALUES
(6, 'Sales Lead', 100000, 69);
INSERT INTO `roles` (`id`, `name`, `salary`, `department_id`) VALUES
(7, 'Salesperson', 80000, 69);
INSERT INTO `roles` (`id`, `name`, `salary`, `department_id`) VALUES
(8, 'Lead Engineer', 150000, 70);
INSERT INTO `roles` (`id`, `name`, `salary`, `department_id`) VALUES
(9, 'Software Engineer', 120000, 70),
(10, 'Accountant', 125000, 71),
(11, 'Legal Team Lead', 250000, 72),
(12, 'Lawyer', 190000, 72);

INSERT INTO `employees` (`id`, `first_name`, `last_name`, `role_id`, `manager_id`) VALUES
(16, 'Laura', 'Sullivan', 8, NULL),
(18, 'Joseph', 'James', 10, NULL),
(19, 'Michael', 'Jackson', 11, NULL);
INSERT INTO `employees` (`id`, `first_name`, `last_name`, `role_id`, `manager_id`) VALUES
(13, 'Sarah', 'Bullwick', 6, 16);
INSERT INTO `employees` (`id`, `first_name`, `last_name`, `role_id`, `manager_id`) VALUES
(15, 'Phil', 'Swift', 7, 13);
INSERT INTO `employees` (`id`, `first_name`, `last_name`, `role_id`, `manager_id`) VALUES
(17, 'Rashan', 'Jones', 9, 16),
(20, 'Annie', 'OtherName', 12, 19),
(21, 'Jonathan', 'Bobist', 9, 16);
