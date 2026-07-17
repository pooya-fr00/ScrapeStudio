# ScrapeStudio

[English README](README.md) | فارسی

ScrapeStudio یک ابزار رایگان، متن‌باز، بدون ثبت‌نام و دوزبانه برای استخراج دادهٔ ساخت‌یافته از صفحه‌های عمومی و استاتیک وب است. نسخهٔ عمومی [`v1.0.0`](https://github.com/pooya-fr00/ScrapeStudio/releases/tag/v1.0.0) در [scrapestudio.pages.dev](https://scrapestudio.pages.dev/fa) در دسترس است.

## امتحان در سه مرحله

1. [Playground محصولات](https://scrapestudio.pages.dev/fa/playground/products) را باز کنید.
2. گزینهٔ **تحلیل این نمونه** را بزنید. محتوای نمونه داخل خود برنامه بارگذاری می‌شود و هیچ درخواستی به سایت خارجی نمی‌رود و سهمیهٔ دریافت عمومی مصرف نمی‌شود.
3. نتیجه را بررسی کنید؛ سپس بخش **استخراج‌گر سفارشی** را باز کنید، **استفاده از دستور نمونه** را بزنید و آن را اجرا کنید. در پایان می‌توانید دستور استخراج را داخل مرورگر ذخیره یا خروجی JSON/CSV دریافت کنید.

## قابلیت‌های اصلی

- استخراج جدول، لینک، تصویر، عنوان‌ها، metadata و JSON-LD از HTML استاتیک؛
- ساخت دستور استخراج چندفیلدی با CSS selector و نمایش تعداد matchها؛
- تشخیص محدود و heuristic ساختارهای تکرارشونده در Web Worker؛
- خروجی JSON و CSV با کاهش ریسک CSV formula injection؛
- نگهداری دستورهای استخراج و تاریخچهٔ سبک فقط در IndexedDB مرورگر؛
- تولید کد شروع برای Python و JavaScript/Node؛
- رابط فارسی RTL و انگلیسی LTR با تجربهٔ جداگانه برای موبایل.

## محدوده و حریم خصوصی

ScrapeStudio فقط برای صفحه‌های عمومی و استاتیک HTTP/HTTPS طراحی شده است. این پروژه صفحهٔ خصوصی، محتوای نیازمند ورود، CAPTCHA یا anti-bot bypass، proxy rotation، cookie import، browser automation و crawl نامحدود را پشتیبانی نمی‌کند. Smart Detection مبتنی بر heuristic است و AI نیست.

HTML دریافت‌شده روی سرور ذخیره نمی‌شود و داخل DOM زندهٔ برنامه قرار نمی‌گیرد. دستورهای استخراج و تاریخچهٔ سبک به‌صورت محلی در مرورگر می‌مانند. کنترل‌های امنیتی برای کاهش ریسک هستند و تضمین امنیت کامل محسوب نمی‌شوند.

استفاده از ابزار باید متناسب و مسئولانه باشد و قوانین، حریم خصوصی، حق نشر، شرایط سایت منبع و محدودیت‌های آن رعایت شود.

## مسیرهای مطالعه

### برای کاربران

- [نسخهٔ زنده](https://scrapestudio.pages.dev/fa)
- [Playground](https://scrapestudio.pages.dev/fa/playground)
- [راهنمای محصول](https://scrapestudio.pages.dev/fa/docs)
- [محدودیت‌ها](https://scrapestudio.pages.dev/fa/limitations)
- [حریم خصوصی](https://scrapestudio.pages.dev/fa/privacy)
- [استفادهٔ مسئولانه](https://scrapestudio.pages.dev/fa/responsible-use)

### برای توسعه‌دهندگان و بررسی فنی

مستندات فنی مرجع به زبان انگلیسی در [README اصلی](README.md) و پوشهٔ [`docs`](docs) قرار دارند. مسیرهای مهم:

- [راه‌اندازی محلی](README.md#run-locally)
- [معماری دریافت امن](docs/SECURE_FETCH.md)
- [هستهٔ استخراج](docs/EXTRACTION_CORE.md)
- [استقرار Production](docs/DEPLOYMENT.md)
- [وضعیت پیاده‌سازی](docs/IMPLEMENTATION_STATUS.md)
- [شواهد Release نسخهٔ v1.0.0](docs/RELEASE_EVIDENCE.md)
- [مشارکت در پروژه](CONTRIBUTING.md)

## پشتیبانی و گزارش امنیتی

برای Bug، Feature Request و سؤال عمومی از مسیرهای [`SUPPORT.md`](SUPPORT.md) استفاده کنید. آسیب‌پذیری امنیتی را در Issue عمومی ننویسید و آن را با [GitHub Security Advisory خصوصی](https://github.com/pooya-fr00/ScrapeStudio/security/advisories/new) گزارش کنید.

این پروژه با مجوز [MIT](LICENSE) منتشر شده است.
