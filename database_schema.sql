-- Blog and Quote Database Schema for Prathmesh Roadlines
-- Execute these queries in your MySQL database

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tags Table
CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Blogs Table
CREATE TABLE IF NOT EXISTS blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT,
    content LONGTEXT NOT NULL,
    image VARCHAR(500),
    author VARCHAR(100) NOT NULL DEFAULT 'Admin',
    status ENUM('draft', 'published') DEFAULT 'published',
    publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_time VARCHAR(20) DEFAULT '5 min read',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_publish_date (publish_date)
);

-- 4. Blog Categories Junction Table
CREATE TABLE IF NOT EXISTS blog_categories (
    blog_id INT,
    category_id INT,
    PRIMARY KEY (blog_id, category_id),
    FOREIGN KEY (blog_id) REFERENCES blogs (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
);

-- 5. Blog Tags Junction Table
CREATE TABLE IF NOT EXISTS blog_tags (
    blog_id INT,
    tag_id INT,
    PRIMARY KEY (blog_id, tag_id),
    FOREIGN KEY (blog_id) REFERENCES blogs (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
);

-- 6. Quotes Table
CREATE TABLE IF NOT EXISTS quotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    company VARCHAR(200),
    from_location VARCHAR(200) NOT NULL,
    to_location VARCHAR(200) NOT NULL,
    product_type ENUM(
        'Edible Oil',
        'Chemicals',
        'Other'
    ) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit ENUM(
        'Liters',
        'Tons',
        'Containers'
    ) NOT NULL,
    message TEXT,
    preferred_contact_method ENUM('email', 'phone', 'whatsapp'),
    status ENUM(
        'pending',
        'contacted',
        'quoted',
        'closed'
    ) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Insert Sample Data for Testing

-- Insert Sample Categories
INSERT INTO
    categories (name, slug, description)
VALUES (
        'Industry News',
        'industry-news',
        'Latest news and updates from the oil transportation industry'
    ),
    (
        'Transportation',
        'transportation',
        'Insights and trends in transportation'
    ),
    (
        'Safety',
        'safety',
        'Safety measures and protocols in oil transport'
    ),
    (
        'Technology',
        'technology',
        'Technological advancements in logistics'
    ),
    (
        'Regulations',
        'regulations',
        'Regulatory updates and compliance'
    );

-- Insert Sample Tags
INSERT INTO
    tags (name, slug)
VALUES ('oil', 'oil'),
    ('logistics', 'logistics'),
    ('future', 'future'),
    ('safety', 'safety'),
    ('technology', 'technology'),
    ('regulations', 'regulations'),
    (
        'transportation',
        'transportation'
    ),
    ('chemicals', 'chemicals'),
    ('edible-oil', 'edible-oil'),
    ('innovation', 'innovation');

-- Insert Sample Blog Posts
INSERT INTO
    blogs (
        title,
        slug,
        excerpt,
        content,
        image,
        author,
        publish_date,
        read_time
    )
VALUES (
        'The Future of Oil Transportation',
        'future-of-oil-transportation',
        'Exploring the latest trends in oil transportation...',
        'Full blog post content about the future of oil transportation with detailed insights on emerging technologies and market trends...',
        '/uploads/blogs/future-oil.jpg',
        'Admin',
        '2025-12-01 10:00:00',
        '5 min read'
    ),
    (
        'Safety Measures in Oil Transport',
        'safety-measures-oil-transport',
        'Learn about essential safety protocols...',
        'Comprehensive guide to safety measures in oil transportation, including best practices and regulatory requirements...',
        '/uploads/blogs/safety.jpg',
        'Admin',
        '2025-11-25 14:30:00',
        '4 min read'
    ),
    (
        'Innovations in Liquid Logistics',
        'innovations-liquid-logistics',
        'Discover cutting-edge solutions...',
        'Exploring the latest innovations in liquid logistics and how they are reshaping the industry...',
        '/uploads/blogs/innovation.jpg',
        'Admin',
        '2025-11-20 09:15:00',
        '6 min read'
    );

-- Link Blogs to Categories
INSERT INTO
    blog_categories (blog_id, category_id)
VALUES (1, 1),
    (1, 2), -- Future of Oil Transportation -> Industry News, Transportation
    (2, 3),
    (2, 2), -- Safety Measures -> Safety, Transportation  
    (3, 4),
    (3, 2);
-- Innovations -> Technology, Transportation

-- Link Blogs to Tags
INSERT INTO
    blog_tags (blog_id, tag_id)
VALUES (1, 1),
    (1, 2),
    (1, 3), -- Future post -> oil, logistics, future
    (2, 4),
    (2, 6),
    (2, 7), -- Safety post -> safety, regulations, transportation
    (3, 5),
    (3, 2),
    (3, 10);
-- Innovation post -> technology, logistics, innovation

-- Insert Sample Quote Request
INSERT INTO
    quotes (
        name,
        email,
        phone,
        company,
        from_location,
        to_location,
        product_type,
        quantity,
        unit,
        message,
        preferred_contact_method
    )
VALUES (
        'Rajesh Kumar',
        'rajesh@example.com',
        '+919876543210',
        'Kumar Transport Co',
        'Mumbai, Maharashtra',
        'Delhi, NCR',
        'Edible Oil',
        5000,
        'Liters',
        'Need regular transportation for edible oil from Mumbai to Delhi',
        'email'
    );