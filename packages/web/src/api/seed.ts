import { inArray } from "drizzle-orm";
import { db } from "./database";
import * as schema from "./database/schema";
import { auth } from "./auth";

const CATEGORIES = [
  { slug: "sharqi", nameAr: "شرقي", nameEn: "Oriental", sort: 1 },
  { slug: "gharbi", nameAr: "غربي", nameEn: "Western", sort: 2 },
  { slug: "bakery", nameAr: "بكري", nameEn: "Bakery", sort: 3 },
];

const PRODUCTS = [
  { slug: "oreo", category: "gharbi", price: 75, popular: true, nameAr: "ميني كيك أوريو", nameEn: "Oreo Mini Cake", descAr: "بانديت شوكولاتة طري مغطّى بصوص الشوكولاتة ومزيّن بقطعة أوريو كاملة.", descEn: "Moist chocolate bundt drizzled with chocolate & topped with a whole Oreo." },
  { slug: "lotus", category: "gharbi", price: 75, popular: true, nameAr: "ميني كيك لوتس", nameEn: "Lotus Mini Cake", descAr: "بانديت فانيليا ذهبي بكريمة اللوتس بسكوف وقطع البسكويت.", descEn: "Golden vanilla bundt with creamy Lotus Biscoff drizzle and biscuit." },
  { slug: "pistachio", category: "gharbi", price: 85, popular: true, nameAr: "ميني كيك فستق", nameEn: "Pistachio Mini Cake", descAr: "بانديت شوكولاتة بصوص الفستق الغني ومبشور الفستق.", descEn: "Chocolate bundt with rich pistachio glaze and crushed pistachios." },
  { slug: "redvelvet", category: "gharbi", price: 80, popular: false, nameAr: "ميني كيك ريد فيلفت", nameEn: "Red Velvet Mini Cake", descAr: "بانديت ريد فيلفت ناعم بصوص الشوكولاتة البيضا وتاج من الكرز.", descEn: "Velvety red bundt with white chocolate drizzle and a cherry crown." },
  { slug: "claypot", category: "sharqi", price: 65, popular: true, nameAr: "كلاي بوت دونتس تايم", nameEn: "Donuts Time Clay Pot", descAr: "حلى الشوكولاتة المميّز بتاعنا في طاجن فخار مع أوريو وكريمة.", descEn: "Our signature chocolate dessert in a clay pot with Oreo & cream." },
  { slug: "lemontart", category: "sharqi", price: 90, popular: false, nameAr: "تارت الليمون مرنغ", nameEn: "Lemon Meringue Tart", descAr: "تارت مقرمش محشي كريمة الليمون الحامضة والمرنغ المحمّص.", descEn: "Crisp tart filled with tangy lemon curd and toasted meringue." },
  { slug: "lotusbun", category: "bakery", price: 45, popular: false, nameAr: "بان الشوكولاتة باللوتس", nameEn: "Chocolate Lotus Bun", descAr: "بان بريوش طري محشي شوكولاتة ومرشوش فتافيت لوتس.", descEn: "Soft brioche bun filled with chocolate and topped with Lotus crumbs." },
  { slug: "mirror", category: "bakery", price: 350, popular: false, nameAr: "كيك ميرور شوكولاتة", nameEn: "Chocolate Mirror Cake", descAr: "تزجيج شوكولاتة لامع متوّج بوردة من الشوكولاتة البيضا.", descEn: "Glossy chocolate mirror glaze crowned with a white chocolate rose." },
  { slug: "rosebasket", category: "bakery", price: 320, popular: false, nameAr: "كيك سلة الورد", nameEn: "Rose Basket Cake", descAr: "كيك على شكل سلة شوكولاتة منسوجة ومزيّنة بورد سكر يدوي.", descEn: "Woven chocolate basket cake decorated with handmade sugar roses." },
  { slug: "valentine", category: "bakery", price: 300, popular: false, nameAr: "كيك قلب فالنتاين", nameEn: "Valentine Heart Cake", descAr: "كيك على شكل قلب لامع، مثالي للشخص اللي بتحبّه.", descEn: "Heart-shaped glazed cake, perfect for your special someone." },
  { slug: "mario", category: "bakery", price: 450, popular: true, nameAr: "كيك سوبر ماريو", nameEn: "Super Mario Cake", descAr: "كيك فوندان بشخصيات لأحلى احتفال عيد ميلاد للجيمرز.", descEn: "Fun fondant cake for the ultimate gamer's birthday celebration." },
  { slug: "minnie", category: "bakery", price: 450, popular: true, nameAr: "كيك ميني ماوس", nameEn: "Minnie Mouse Cake", descAr: "كيك ميني لطيف بفيونكة منقّطة حمرا للصغيرين.", descEn: "Adorable Minnie cake with a red polka-dot bow for little ones." },
  { slug: "redvelvet-pistachio", category: "gharbi", price: 90, popular: true, nameAr: "ميني كيك ريد فيلفت بستاشيو", nameEn: "Red Velvet Pistachio Mini Cake", descAr: "ميني كيك ريد فيلفت طري بصوص البستاشيو الأخضر الغني ومكسرات فستق.", descEn: "Soft red velvet mini cake with rich green pistachio glaze and crushed pistachios." },
  { slug: "redvelvet-choco", category: "gharbi", price: 85, popular: false, nameAr: "ميني كيك ريد فيلفت شوكولاتة", nameEn: "Red Velvet Chocolate Mini Cake", descAr: "ميني كيك ريد فيلفت مغطّى بصوص الشوكولاتة الغني وقطع بسكويت.", descEn: "Red velvet mini cake drizzled with rich chocolate sauce and biscuit pieces." },
  { slug: "oreo-biscuit-cake", category: "bakery", price: 280, popular: true, nameAr: "تورتة شوكولاتة أوريو", nameEn: "Oreo Chocolate Cake", descAr: "تورتة شوكولاتة غنية مزيّنة بالأوريو والبسكويت وصوص الشوكولاتة.", descEn: "Rich chocolate cake decorated with Oreo, biscuits and chocolate sauce." },
  { slug: "cheesecake-classic", category: "gharbi", price: 95, popular: true, nameAr: "تشيز كيك كلاسيك", nameEn: "Classic Cheesecake", descAr: "تشيز كيك نيويورك كريمي على قاعدة بسكويت مقرمشة.", descEn: "Creamy New York style cheesecake on a crisp biscuit base." },
  { slug: "cheesecake-strawberry", category: "gharbi", price: 100, popular: false, nameAr: "تشيز كيك فراولة", nameEn: "Strawberry Cheesecake", descAr: "تشيز كيك طري بصوص الفراولة الطازة وقطع الفراولة.", descEn: "Soft cheesecake topped with fresh strawberry sauce and berry pieces." },
  { slug: "chocolate-tart", category: "gharbi", price: 90, popular: false, nameAr: "تارت شوكولاتة", nameEn: "Chocolate Tart", descAr: "تارت مقرمش محشي جاناش شوكولاتة غني ومزيّن بالذهب الصالح للأكل.", descEn: "Crisp tart filled with rich chocolate ganache, finished with edible gold." },
  { slug: "petit-four-box", category: "gharbi", price: 150, popular: true, nameAr: "بتي فور مشكل", nameEn: "Petit Four Box", descAr: "علبة بتي فور مشكلة من أجود أنواع الحلويات الغربية المصغّرة.", descEn: "Assorted box of fine bite-sized Western petit fours." },
  { slug: "date-almond-box", category: "sharqi", price: 180, popular: true, nameAr: "علبة تمر باللوز", nameEn: "Date & Almond Box", descAr: "تمر فاخر محشي باللوز مغطّى بطبقة شوكولاتة، تقديم فاخر في علبة هدية.", descEn: "Premium dates stuffed with almonds and coated in chocolate, gift-boxed." },
  { slug: "chocolate-praline-box", category: "sharqi", price: 220, popular: true, nameAr: "علبة برالين شوكولاتة", nameEn: "Chocolate Praline Box", descAr: "تشكيلة فاخرة من البرالين بحشوات متنوعة، تقديم أنيق في علبة هدية.", descEn: "Luxury assorted chocolate pralines with varied fillings, elegantly gift-boxed." },
  { slug: "pistachio-basbousa", category: "sharqi", price: 140, popular: false, nameAr: "بسبوسة فستق", nameEn: "Pistachio Basbousa Bites", descAr: "بسبوسة طرية بقطر خفيف ومغطّاة بكريمة وفستق مبشور.", descEn: "Soft semolina basbousa bites in light syrup, topped with cream and crushed pistachio." },
  { slug: "pistachio-konafa", category: "sharqi", price: 150, popular: false, nameAr: "كنافة نمورة بالفستق", nameEn: "Pistachio Konafa Bites", descAr: "قطع كنافة نمورة مقرمشة محشية قشطة ومغطّاة بالفستق المبشور.", descEn: "Crispy shredded konafa bites filled with cream and topped with crushed pistachio." },
];

const SETTINGS: Record<string, string> = {
  phone: "01061511677",
  phone2: "01061511817",
  whatsapp: "201061511677",
  email: "timeedonuts55@gmail.com",
  facebook: "https://www.facebook.com/profile.php?id=61575056691248",
  addressAr: "٧٥ شارع إبراهيم عبدالرازق، عين شمس الشرقية، القاهرة",
  addressEn: "75 Ibrahim Abdelrazek St, Ain Shams Sharkeya, Cairo",
  mapsQuery: "Donuts Time Ain Shams Cairo",
};

const ADMIN_EMAIL = "admin@donutstime.com";
const ADMIN_PASSWORD = "admin123";

async function seed() {
  // Categories
  for (const cat of CATEGORIES) {
    await db.insert(schema.categories).values(cat).onConflictDoNothing();
  }
  // Remove any legacy categories that are no longer in the list
  const keepSlugs = CATEGORIES.map((c) => c.slug);
  const allCats = await db.select().from(schema.categories);
  const stale = allCats.filter((c) => !keepSlugs.includes(c.slug));
  if (stale.length > 0) {
    await db.delete(schema.categories).where(
      inArray(
        schema.categories.slug,
        stale.map((c) => c.slug),
      ),
    );
  }
  console.log("✓ categories seeded");

  // Products — insert if new, update category if already present
  let i = 0;
  for (const p of PRODUCTS) {
    await db
      .insert(schema.products)
      .values({
        ...p,
        img: `/images/products/${p.slug}.png`,
        sort: i++,
      })
      .onConflictDoUpdate({
        target: schema.products.slug,
        set: { category: p.category },
      });
  }
  console.log("✓ products seeded");

  // Settings
  for (const [key, value] of Object.entries(SETTINGS)) {
    await db
      .insert(schema.settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: schema.settings.key, set: { value } });
  }
  console.log("✓ settings seeded");

  // Admin user
  try {
    await auth.api.signUpEmail({
      body: {
        name: "Admin",
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
    });
    console.log(`✓ admin user created: ${ADMIN_EMAIL}`);
  } catch (e: any) {
    console.log(`! admin user: ${e?.message || "already exists"}`);
  }

  console.log("Done.");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
