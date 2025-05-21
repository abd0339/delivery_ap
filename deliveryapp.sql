-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 20, 2025 at 08:27 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `deliveryapp`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `admin_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`admin_id`, `username`, `password_hash`, `email`, `created_at`, `updated_at`) VALUES
(2, '', '$2b$10$exljY.N9ivAqOOJw87NYY.Oo52nSZP8R8WHigZX9jvOdqzfv.dP4S', 'abdelnaser.kh96@gmail.com', '2025-05-04 23:51:08', '2025-05-04 23:51:08');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `customer_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `shop_name` varchar(100) NOT NULL,
  `shop_address` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`customer_id`, `username`, `password`, `email`, `phone_number`, `shop_name`, `shop_address`, `created_at`, `updated_at`) VALUES
(10, 'test1', '$2b$10$TiA7Lp7Aw3uEgnnIbFSyJOiEHkNAO4iILPICmdNz3DkMDMUnTstEK', 'test1@gamil.com', '11111111', 'tripolitest', 'TRIPLOI', '2025-05-12 10:03:24', '2025-05-12 10:03:24'),
(11, 'dr Rami', '$2b$10$k1MC1Yh0sguyZmpB8fJNwe.crLuaNx7xzts1.FEDQbZjcFu14dcdG', 'jinan@gmail.com', '81137470', 'Burger King', 'Mina', '2025-05-12 11:20:41', '2025-05-12 11:20:41'),
(12, 'shoptest4', '$2b$10$7whGbRlRi7HHeBj1k9fHDu1yJGmsGXqpJjF49vWvbcjoBF/22J2Tu', 'test4@gmail.com', '44444444', 'test4', '{\"lat\":33.89469057754214,\"lng\":35.52407781515103}', '2025-05-20 05:16:53', '2025-05-20 05:16:53'),
(13, 'test3', '$2b$10$AkO0705dKiBBcQPXYiMdCOC8xUlFWBykkt0X7GKxI8B2tCIOk/jr2', 'test3@gamil.com', '33333333', 'shop3', '{\"lat\":34.44131518349636,\"lng\":35.821085209748354}', '2025-05-20 20:18:47', '2025-05-20 20:18:47');

-- --------------------------------------------------------

--
-- Table structure for table `drivers`
--

CREATE TABLE `drivers` (
  `driver_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `vehicle_type` varchar(50) NOT NULL,
  `id_verification_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_document` varchar(255) DEFAULT NULL,
  `verification_status` enum('pending','verified','rejected') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `drivers`
--

INSERT INTO `drivers` (`driver_id`, `username`, `password`, `email`, `phone_number`, `vehicle_type`, `id_verification_id`, `created_at`, `updated_at`, `id_document`, `verification_status`) VALUES
(9, 'drivertest', '$2b$10$q2eQcRyAFdJiAmPALpzEd.c.cnjf7I/rSrY6.wl9al22YSSugZf86', 'drivertest1@gamil.com', '11111111', 'moto', NULL, '2025-05-12 10:14:22', '2025-05-12 10:14:22', '1747034062747-Figure_1.png', 'pending'),
(10, 'driver2', '$2b$10$NTD7tyULBWTHzuucPuasx.dMGIBNaQ4/tcqu5udHPJNXriyKs0nbS', 'drivertest2@gamil.com', '22222222', 'car', NULL, '2025-05-12 10:18:19', '2025-05-12 10:18:19', '1747034299591-Figure_1.png', 'pending'),
(11, 'driver3', '$2b$10$RAg4NbpVjwesr9rw1YfDyuLTcx2Husxn0Px8LFKTxTtK7gBVEBjgy', 'drivertest3@gamil.com', '33333333', 'moto', NULL, '2025-05-16 00:05:55', '2025-05-16 00:05:55', '1747343155276-Figure_1.png', 'pending');

-- --------------------------------------------------------

--
-- Table structure for table `driver_verification`
--

CREATE TABLE `driver_verification` (
  `id_verification_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `document_type` enum('id_card','passport') NOT NULL,
  `document_image` varchar(255) NOT NULL,
  `verified` tinyint(1) DEFAULT 0 COMMENT '0=pending, 1=approved',
  `verified_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `driver_id` int(11) DEFAULT NULL,
  `origin_address` varchar(255) NOT NULL,
  `delivery_address` varchar(255) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `predicted_price` decimal(10,2) DEFAULT 0.00,
  `payment_method` enum('cash','wallet') DEFAULT NULL,
  `status` enum('pending','assigned','in_transit','delivered','cancelled') DEFAULT 'pending',
  `serial_number` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `order_type` enum('simple','package') DEFAULT 'simple',
  `length` float DEFAULT NULL,
  `weight` float DEFAULT NULL,
  `price` decimal(10,0) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `customer_id`, `driver_id`, `origin_address`, `delivery_address`, `total_amount`, `predicted_price`, `payment_method`, `status`, `serial_number`, `created_at`, `updated_at`, `order_type`, `length`, `weight`, `price`) VALUES
(1, 10, 9, 'TRIPLOI', '\"0096171822918\"', 163881.35, 162681.35, 'cash', '', '123456789', '2025-05-15 23:45:25', '2025-05-16 00:57:26', 'simple', NULL, NULL, 1200),
(2, 10, 9, 'TRIPLOI', '\"0096171822918\"', 164081.35, 162681.35, 'cash', '', '123456789', '2025-05-16 00:00:01', '2025-05-16 01:10:01', 'simple', NULL, NULL, 1400),
(3, 10, 9, 'TRIPLOI', '{\"lat\":33.88797941376663,\"lng\":35.50201471851785}', 164081.35, 162681.35, 'cash', '', '123456789102', '2025-05-16 00:02:20', '2025-05-16 01:33:27', 'simple', NULL, NULL, 1400),
(4, 10, 9, 'TRIPLOI', '\"71822918\"', 164081.35, 162681.35, 'cash', '', '123456789022', '2025-05-16 01:57:39', '2025-05-16 01:58:13', 'simple', NULL, NULL, 1400),
(5, 11, 10, 'Mina', '{\"lat\":34.43739233761022,\"lng\":35.81258193687045}', 1762681.35, 162681.35, 'cash', 'delivered', '1234567890', '2025-05-19 23:22:30', '2025-05-19 23:25:44', 'simple', NULL, NULL, 1600000),
(6, 10, 9, 'TRIPLOI', '{\"lat\":34.446877667763424,\"lng\":35.82901613891835}', 2162681.35, 162681.35, 'cash', '', '01234578', '2025-05-19 23:39:20', '2025-05-20 00:52:52', 'simple', NULL, NULL, 2000000),
(7, 11, NULL, 'Mina', '\"0096171822918\"', 2662681.35, 162681.35, 'cash', 'pending', '02465789', '2025-05-20 00:05:26', '2025-05-20 00:05:26', 'simple', NULL, NULL, 2500000),
(8, 12, NULL, '{\"lat\":33.89469057754214,\"lng\":35.52407781515103}', '{\"lat\":34.409529741304084,\"lng\":35.84697246551514}', 1662681.35, 162681.35, 'cash', 'pending', '123456789', '2025-05-20 20:49:52', '2025-05-20 20:49:52', 'simple', NULL, NULL, 1500000),
(9, 12, NULL, '{\"lat\":33.89469057754214,\"lng\":35.52407781515103}', '\"0096171822918\"', 1662681.35, 162681.35, 'cash', 'pending', '123456798', '2025-05-20 20:51:58', '2025-05-20 20:51:58', 'simple', NULL, NULL, 1500000),
(10, 10, NULL, 'TRIPLOI', '{\"lat\":34.44983949873016,\"lng\":35.842618525124955}', 2162681.35, 162681.35, 'cash', 'pending', '1234567890', '2025-05-20 21:07:45', '2025-05-20 21:07:45', 'simple', NULL, NULL, 2000000);

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `rating_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `rating` tinyint(4) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `transaction_id` int(11) NOT NULL,
  `wallet_id_in` int(11) NOT NULL,
  `wallet_id_out` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `type` enum('deposit','withdrawal','transfer') NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wallets`
--

CREATE TABLE `wallets` (
  `wallet_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_type` enum('customer','driver') NOT NULL,
  `balance` decimal(10,2) DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wallets`
--

INSERT INTO `wallets` (`wallet_id`, `user_id`, `user_type`, `balance`, `created_at`, `updated_at`) VALUES
(116, 10, '', 0.00, '2025-05-12 10:03:50', '2025-05-12 10:03:50'),
(120, 10, 'customer', 0.00, '2025-05-12 10:04:00', '2025-05-12 10:04:00'),
(127, 9, 'driver', 0.00, '2025-05-12 10:15:28', '2025-05-12 10:15:28'),
(128, 10, 'driver', 0.00, '2025-05-12 10:18:50', '2025-05-12 10:18:50'),
(129, 11, '', 0.00, '2025-05-12 11:20:55', '2025-05-12 11:20:55'),
(161, 11, 'driver', 0.00, '2025-05-16 00:06:09', '2025-05-16 00:06:09'),
(206, 12, '', 0.00, '2025-05-20 05:17:03', '2025-05-20 05:17:03');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`customer_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`driver_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `driver_verification`
--
ALTER TABLE `driver_verification`
  ADD PRIMARY KEY (`id_verification_id`),
  ADD KEY `driver_id` (`driver_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `driver_id` (`driver_id`);

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`rating_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `driver_id` (`driver_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `wallet_id_in` (`wallet_id_in`),
  ADD KEY `wallet_id_out` (`wallet_id_out`);

--
-- Indexes for table `wallets`
--
ALTER TABLE `wallets`
  ADD PRIMARY KEY (`wallet_id`),
  ADD UNIQUE KEY `unique_user_wallet` (`user_id`,`user_type`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=0;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `drivers`
--
ALTER TABLE `drivers`
  MODIFY `driver_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `driver_verification`
--
ALTER TABLE `driver_verification`
  MODIFY `id_verification_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `rating_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `wallets`
--
ALTER TABLE `wallets`
  MODIFY `wallet_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=216;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `driver_verification`
--
ALTER TABLE `driver_verification`
  ADD CONSTRAINT `driver_verification_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`);

--
-- Constraints for table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`) ON DELETE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`wallet_id_in`) REFERENCES `wallets` (`wallet_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`wallet_id_out`) REFERENCES `wallets` (`wallet_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
