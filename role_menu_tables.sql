-- 1. Ana rolleri ve çevirilerini tutacağımız sabit tablo
CREATE TABLE global_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_key VARCHAR(50) UNIQUE NOT NULL, -- Kod içinde kullanım için, örn: pvp
    role_name VARCHAR(100) NOT NULL, -- Sunucuda ve arayüzde gösterilecek İngilizce adı
    category VARCHAR(50) DEFAULT 'general', -- Gruplama için (combat, economy, gathering, crafting)
    color VARCHAR(7) DEFAULT '#808080', -- Role atanacak HEX renk kodu
    icon_emoji TEXT, -- Menüde gösterilecek Discord emojisi
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Sunucularda oluşturulan Discord rollerinin ID'lerini tutacağımız tablo
CREATE TABLE guild_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT NOT NULL,
    role_key VARCHAR(50) NOT NULL REFERENCES global_roles(role_key),
    discord_role_id TEXT NOT NULL, -- Discord'daki gerçek Rol ID'si
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(guild_id, role_key) -- Bir sunucuda bir rolden sadece 1 tane kaydedilebilir
);

-- 3. Sunucunun rol menüsü ayarları ve limitlerini tutacağımız tablo
CREATE TABLE guild_role_menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT UNIQUE NOT NULL,
    channel_id TEXT, -- Mesajın gönderileceği kanal
    message_id TEXT, -- Gönderilen menü mesajının ID'si (sonradan güncellemek için)
    active_roles JSONB, -- Menüde gösterilmek üzere seçilen rollerin dizisi
    category_limits JSONB DEFAULT '{"combat": 5, "economy": 5, "crafting": 5}', -- Sunucu sahibinin belirlediği kategori bazlı rol alma limitleri
    header_image_url TEXT, -- Menünün üstünde gösterilecek estetik resim URL'si
    is_installed BOOLEAN DEFAULT false, -- Kurulum yapıldı mı?
    trigger_roles_setup BOOLEAN DEFAULT false, -- Botun rolleri kurması için tetikleyici
    trigger_roles_menu_send BOOLEAN DEFAULT false, -- Botun menüyü kanala atması için tetikleyici
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Varsayılan Rollerin Veritabanına Eklenmesi
INSERT INTO global_roles (role_key, role_name, category, color, icon_emoji) VALUES
('pvp', 'PvP', 'combat', '#E74C3C', '⚔️'),
('pve', 'PvE', 'combat', '#3498DB', '🛡️'),
('hardcore', 'Hardcore', 'combat', '#9B59B6', '💀'),
('ganker', 'Ganker', 'combat', '#8E44AD', '🗡️'),
('trader', 'Trader', 'economy', '#F1C40F', '💰'),
('gatherer', 'Gatherer', 'gathering', '#2ECC71', '⛏️'),
('farmer', 'Farmer', 'economy', '#27AE60', '🌾'),
('fisherman', 'Fisherman', 'gathering', '#34495E', '🎣'),
('refiner', 'Refiner', 'crafting', '#E67E22', '🔥'),
('warrior_crafter', 'Warrior Crafter', 'crafting', '#D35400', '⚒️'),
('hunter_crafter', 'Hunter Crafter', 'crafting', '#16A085', '🏹'),
('mage_crafter', 'Mage Crafter', 'crafting', '#8E44AD', '🔮'),
('toolmaker', 'Toolmaker', 'crafting', '#7F8C8D', '🎒'),
('chef', 'Chef', 'crafting', '#D35400', '🍲'),
('alchemist', 'Alchemist', 'crafting', '#9B59B6', '🧪');
