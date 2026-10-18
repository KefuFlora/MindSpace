-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 18, 2026 at 11:23 PM
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
-- Database: `mindspace_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `flagged_comments`
--

CREATE TABLE `flagged_comments` (
  `id` bigint(20) NOT NULL,
  `comment_content` text NOT NULL,
  `comment_id` varchar(255) NOT NULL,
  `flagged_date` varchar(255) NOT NULL,
  `report_reason` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `flagged_comments`
--

INSERT INTO `flagged_comments` (`id`, `comment_content`, `comment_id`, `flagged_date`, `report_reason`, `status`) VALUES
(1, 'I completely understand what you\'re going through. You\'re definitely not alone in dealing with university pressure.', 'comment001', '02 October 2026', 'Inappropriate language', 'Removed'),
(2, 'You should stop complaining and just work harder like everyone else.', 'comment002', '02 October 2026', 'Harassment', 'Pending Review'),
(3, 'This is a university support forum. I don\'t think advertisements belong here.', 'comment003', '02 October 2026', 'Spam', 'Pending Review');

-- --------------------------------------------------------

--
-- Table structure for table `flagged_posts`
--

CREATE TABLE `flagged_posts` (
  `id` bigint(20) NOT NULL,
  `flagged_date` varchar(255) NOT NULL,
  `post_content` text NOT NULL,
  `post_id` varchar(255) NOT NULL,
  `report_reason` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `flagged_posts`
--

INSERT INTO `flagged_posts` (`id`, `flagged_date`, `post_content`, `post_id`, `report_reason`, `status`) VALUES
(1, '02 October 2026', 'I\'ve been struggling with the amount of academic pressure I\'m experiencing this semester...', 'post001', 'Inappropriate content', 'Approved'),
(2, '02 October 2026', 'Has anyone else experienced problems with students being disrespectful during group projects?', 'post002', 'Harassment', 'Pending Review'),
(3, '02 October 2026', 'I don\'t think this discussion belongs in the student support community...', 'post003', 'Off-topic content', 'Removed');

-- --------------------------------------------------------

--
-- Table structure for table `moderators`
--

CREATE TABLE `moderators` (
  `id` bigint(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `moderators`
--

INSERT INTO `moderators` (`id`, `email`, `full_name`, `password`, `username`) VALUES
(1, 'moderator1@mindspace.com', 'MindSpace Moderator', '$2a$10$73ZbW6TC7rsXAMJACQW5juJ/hTM9pkp9NxbgrmAclNk6e/ZrwWtVq', 'moderator1');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `flagged_comments`
--
ALTER TABLE `flagged_comments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKlk70pmo8kd5i9wqmvyir8gmft` (`comment_id`);

--
-- Indexes for table `flagged_posts`
--
ALTER TABLE `flagged_posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK2af3kwjsxbvb8alcc2xmuh5jy` (`post_id`);

--
-- Indexes for table `moderators`
--
ALTER TABLE `moderators`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK97fmhw4ymusmxlnofbsf12q9x` (`email`),
  ADD UNIQUE KEY `UK6hnpm3mxto1g997q4rcfb7v6o` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `flagged_comments`
--
ALTER TABLE `flagged_comments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `flagged_posts`
--
ALTER TABLE `flagged_posts`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `moderators`
--
ALTER TABLE `moderators`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
