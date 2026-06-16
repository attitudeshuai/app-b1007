SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS app_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(50) UNIQUE NOT NULL,
    value TEXT NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO app_settings (`key`, `value`) VALUES 
('theme', 'dark'),
('model_api', 'https://api.ywzxkj.com'),
('api_key', 'sk-IdMtusB1laSIKy6RGqtzh8QRmW7EMlbXFif19rqpTTBjzWPF'),
('notification_system', 'true'),
('notification_message', 'true'),
('notification_performance', 'true')
ON DUPLICATE KEY UPDATE value = VALUES(value);

INSERT IGNORE INTO chat_messages (role, content) VALUES 
('system', '欢迎使用 AI 桌面助手！'),
('user', '你好，帮我查看一下系统状态。'),
('assistant', '收到，正在为您加载系统监控模块...');
