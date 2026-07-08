export type Category = string;

export interface Product {
  id: string;
  category: Category;
  img: string;
  price: number;
  popular?: boolean;
  hidden?: boolean;
  name: { ar: string; en: string };
  desc: { ar: string; en: string };
}

export interface CategoryItem {
  slug: string;
  name: { ar: string; en: string };
}

/* Static fallback shown only before the API responds */
export const PRODUCTS: Product[] = [];

export const CATEGORIES: CategoryItem[] = [
  { slug: "sharqi", name: { ar: "شرقي", en: "Oriental" } },
  { slug: "gharbi", name: { ar: "غربي", en: "Western" } },
  { slug: "bakery", name: { ar: "بكري", en: "Bakery" } },
];

export const BIZ = {
  phone: "01061511677",
  phone2: "01061511817",
  whatsapp: "201061511677",
  email: "timeedonuts55@gmail.com",
  facebook: "https://www.facebook.com/profile.php?id=61575056691248",
  addressAr: "٧٥ شارع إبراهيم عبدالرازق، عين شمس الشرقية، القاهرة",
  addressEn: "75 Ibrahim Abdelrazek St, Ain Shams Sharkeya, Cairo",
  mapsQuery: "Donuts Time Ain Shams Cairo",
};
