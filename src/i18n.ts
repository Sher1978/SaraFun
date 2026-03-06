import WebApp from '@twa-dev/sdk';

/**
 * Lightweight translation bridge for SaraFun.
 * Supports EN (English), RU (Russian), VN (Vietnamese).
 */

const translations = {
    en: {
        explore: "Explore",
        map: "Map",
        scan: "Scan",
        justice: "Justice",
        profile: "Profile",
        master_mode: "Master Mode",
        business_identity: "Business Identity",
        community_rules: "Community Rules",
        save: "Save",
        category: "Category",
        bio: "Bio",
        hourly_rate: "Price per service ($)",
        invite_friends: "Invite Friends",
        verify_badge: "Verified Master",
        laws_title: "The 5 Laws of SaraFun"
    },
    ru: {
        explore: "Поиск",
        map: "Карта",
        scan: "Сканер",
        justice: "Арбитраж",
        profile: "Профиль",
        master_mode: "Режим Мастера",
        business_identity: "Бизнес профиль",
        community_rules: "Правила сообщества",
        save: "Сохранить",
        category: "Категория",
        bio: "О себе",
        hourly_rate: "Цена за услугу ($)",
        invite_friends: "Пригласить друзей",
        verify_badge: "Проверенный Мастер",
        laws_title: "5 Законов SaraFun"
    },
    vi: {
        explore: "Khám phá",
        map: "Bản đồ",
        scan: "Quét",
        justice: "Công lý",
        profile: "Hồ sơ",
        master_mode: "Chế độ Master",
        business_identity: "Danh tính kinh doanh",
        community_rules: "Quy tắc cộng đồng",
        save: "Lưu",
        category: "Danh mục",
        bio: "Tiểu sử",
        hourly_rate: "Giá mỗi dịch vụ ($)",
        invite_friends: "Mời bạn bè",
        verify_badge: "Master đã xác minh",
        laws_title: "5 Luật của SaraFun"
    }
};

type Lang = 'en' | 'ru' | 'vi';
const userLang = (WebApp.initDataUnsafe?.user?.language_code || 'en').split('-')[0] as Lang;
const activeLang: Lang = translations[userLang] ? userLang : 'en';

export const t = (key: keyof typeof translations['en']): string => {
    return translations[activeLang][key] || translations['en'][key];
};
