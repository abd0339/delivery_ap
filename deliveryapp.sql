-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 10, 2025 at 11:48 AM
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
(5, 'test1', '$2b$10$89cnsUgZglku07dx32FfmeoKZu5sGYfZJAFv8kDLDwI5WYrRfxsMm', 'test1@gamil.com', '11111111', 'shoptest1', 'TRIPLOI', '2025-05-04 23:52:53', '2025-05-04 23:52:53'),
(6, 'test2', '$2b$10$umrvpkidtEzVixEWjE/c9eEkmnOq9z3DsV3EDdBD3NgirO4Qrdeze', 'test2@gamil.com', '22222222', 'shoptest2', 'TRIPLOI', '2025-05-05 11:14:06', '2025-05-05 11:14:06'),
(7, 'test3', '$2b$10$kU3nCyYxoZXRaVzrOv10DeDqa/qp7EXofVXyZZx63yQe8lhqxB1BK', 'test3@gamil.com', '33333333', 'shoptest3', 'TRIPLOI', '2025-05-08 00:00:03', '2025-05-08 00:00:03'),
(8, 'test4', '$2b$10$eqL30G5zqqD/m/k83mvws.YJBULUHo0hVeM1jWtgFSNeH1oWTCOyy', 'test4@gmail.com', '44444444', 'shoptest4', 'TRIPLOI', '2025-05-09 22:41:33', '2025-05-09 22:41:33'),
(9, 'test5', '$2b$10$4H5vcyB8P6brU7A1xcIrC.jdYoSIoDaieqJnRF.9ZPN2J.njJumSu', 'test5@gamil.com', '55555555', 'shoptest5', 'abou samra', '2025-05-10 12:08:37', '2025-05-10 12:08:37');

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
(2, '', '$2b$10$xAO2yPj/KE85tR/BjkHQVekU3GvIs4oACNKw9KcKZUU6yfvAFAP6y', 'testdriver@gmail.com', '111111', 'car', NULL, '2025-05-04 23:54:44', '2025-05-04 23:54:44', '1746392084126-Figure_1.png', 'pending'),
(6, 'test2', '$2b$10$35qIah3m7FmZGUaL7Jq8kepUF8o2b5x13rcqX7SD.U15bsW6MXTdC', 'drivertest2@gamil.com', '222222', 'car', NULL, '2025-05-06 21:06:35', '2025-05-06 21:06:35', '1746554795358-Figure_1.png', 'pending'),
(7, 'driver3', '$2b$10$M7pw7.UcwIM5ZcA5VWZzxu5eqVj05jDDJ6N8lJyrrsYu4D7SHBbxG', 'drivertest3@gamil.com', '33333333', 'car', NULL, '2025-05-09 22:44:22', '2025-05-09 22:44:22', '1746819862438-Figure_1.png', 'pending'),
(8, 'driver4', '$2b$10$iG383UaQKVsapYBW9PpOKOsUN0P5s2yPkruF4v/WzybUgxBKE9NPi', 'drivertest4@gamil.com', '44444444', 'car', NULL, '2025-05-10 12:09:39', '2025-05-10 12:09:39', '1746868179765-Figure_1.png', 'pending');

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
  `pickup_address` varchar(255) NOT NULL,
  `delivery_address` varchar(255) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','wallet') DEFAULT NULL,
  `status` enum('pending','assigned','in_transit','delivered','cancelled') DEFAULT 'pending',
  `description` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `customer_id`, `driver_id`, `pickup_address`, `delivery_address`, `total_amount`, `payment_method`, `status`, `description`, `created_at`, `updated_at`) VALUES
(6, 5, NULL, '', 'abou samra', 240.00, 'cash', 'pending', '', '2025-05-06 23:11:10', '2025-05-06 23:11:10'),
(7, 5, NULL, '', 'Al_mina ', 120.00, 'cash', 'pending', '', '2025-05-07 22:44:03', '2025-05-07 22:44:03'),
(8, 5, NULL, '', 'tripploi _ 200', 120.00, 'cash', 'pending', '', '2025-05-07 23:51:27', '2025-05-07 23:51:27'),
(9, 8, NULL, '', 'tripoli abou samra', 220.00, 'cash', 'pending', '', '2025-05-09 22:43:00', '2025-05-09 22:43:00');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `item_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`item_id`, `order_id`, `item_name`, `quantity`, `price`) VALUES
(5, 6, 'test1', 10, 12.00),
(6, 6, 'test11', 12, 10.00),
(7, 7, 'test2', 10, 12.00),
(8, 8, 'test3', 10, 12.00),
(9, 9, 'ordertest', 10, 12.00),
(10, 9, 'item 2', 10, 10.00);

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
(53, 8, '', 0.00, '2025-05-09 22:41:42', '2025-05-09 22:41:42'),
(55, 8, 'customer', 0.00, '2025-05-09 22:42:09', '2025-05-09 22:42:09'),
(60, 7, 'driver', 0.00, '2025-05-09 22:44:31', '2025-05-09 22:44:31'),
(67, 2, 'driver', 0.00, '2025-05-10 01:44:56', '2025-05-10 01:44:56'),
(68, 5, '', 0.00, '2025-05-10 09:27:21', '2025-05-10 09:27:21'),
(76, 5, 'customer', 0.00, '2025-05-10 10:21:59', '2025-05-10 10:21:59'),
(87, 8, 'driver', 0.00, '2025-05-10 12:09:58', '2025-05-10 12:09:58');

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
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `order_id` (`order_id`);

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
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `drivers`
--
ALTER TABLE `drivers`
  MODIFY `driver_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `driver_verification`
--
ALTER TABLE `driver_verification`
  MODIFY `id_verification_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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
  MODIFY `wallet_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=92;

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
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE;

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
