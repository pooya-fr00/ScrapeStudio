import type { SupportedLocale } from '@scrapestudio/shared';

export const DOCUMENT_SLUGS = [
  'methodology',
  'security',
  'limitations',
  'privacy',
  'responsible-use',
  'about',
] as const;

export const TOOL_GUIDE_SLUGS = [
  'table-extractor',
  'link-extractor',
  'image-extractor',
  'metadata-extractor',
  'custom-selector',
] as const;

export type DocumentSlug = (typeof DOCUMENT_SLUGS)[number];
export type ToolGuideSlug = (typeof TOOL_GUIDE_SLUGS)[number];

export interface ContentSection {
  body: readonly string[];
  points?: readonly string[];
  title: string;
}

export interface PublicDocumentContent {
  callout: string;
  calloutTitle: string;
  eyebrow: string;
  sections: readonly ContentSection[];
  summary: string;
  title: string;
}

interface PhaseNineContent {
  common: {
    analyzeDemo: string;
    backToDocs: string;
    backToPlayground: string;
    documentationLabel: string;
    openGuide: string;
    openPlayground: string;
    playgroundLabel: string;
    readDocument: string;
  };
  docs: {
    description: string;
    eyebrow: string;
    items: Record<DocumentSlug, { description: string; title: string }>;
    note: string;
    noteTitle: string;
    title: string;
  };
  documents: Record<DocumentSlug, PublicDocumentContent>;
  playground: {
    demos: Record<
      'article' | 'products' | 'table',
      { badge: string; description: string; signals: readonly string[]; title: string }
    >;
    description: string;
    eyebrow: string;
    localNote: string;
    localNoteTitle: string;
    originalBadge: string;
    pageDescription: string;
    title: string;
  };
  tools: Record<ToolGuideSlug, PublicDocumentContent>;
}

export const phaseNineContent: Record<SupportedLocale, PhaseNineContent> = {
  en: {
    common: {
      analyzeDemo: 'Analyze this demo',
      backToDocs: 'Back to documentation',
      backToPlayground: 'All playground demos',
      documentationLabel: 'Documentation sections',
      openGuide: 'Read tool guide',
      openPlayground: 'Open demo page',
      playgroundLabel: 'Playground demos',
      readDocument: 'Read section',
    },
    docs: {
      eyebrow: 'Product documentation',
      title: 'Understand the method before you trust the result.',
      description:
        'ScrapeStudio documents what it does, what it deliberately refuses to do, and where a human still needs to make the final decision.',
      noteTitle: 'Documentation is part of the product',
      note: 'Security controls, privacy boundaries, extraction limits, and responsible-use expectations are kept visible instead of being hidden behind marketing language.',
      items: {
        methodology: {
          title: 'Methodology',
          description: 'Follow the path from validated URL to detached parsing and bounded output.',
        },
        security: {
          title: 'Security',
          description:
            'Review the fetch threat model, redirect checks, limits, and safe rendering boundary.',
        },
        limitations: {
          title: 'Limitations',
          description:
            'Know which pages and extraction outcomes the free public release can support.',
        },
        privacy: {
          title: 'Privacy',
          description:
            'See what stays in the browser, what crosses the Worker, and what is never stored.',
        },
        'responsible-use': {
          title: 'Responsible use',
          description:
            'Use public data carefully, proportionally, and in line with source-site rules.',
        },
        about: {
          title: 'About ScrapeStudio',
          description: 'Learn the mission, architecture boundary, and open-source release scope.',
        },
      },
    },
    playground: {
      eyebrow: 'Built-in local playground',
      title: 'Test the complete workflow without depending on another website.',
      description:
        'Choose an original bundled page, inspect its structure, then send the exact sample into the extraction workspace without a network request.',
      localNoteTitle: 'Predictable by design',
      localNote:
        'These pages are original project fixtures. They do not consume public fetch quota, contact a third party, or change unexpectedly between test runs.',
      originalBadge: 'Original bundled content',
      pageDescription:
        'This page is a visible local fixture. Use it as a reference, then analyze the same semantic HTML in the workspace.',
      demos: {
        products: {
          badge: 'Repeated cards',
          title: 'Twelve-product catalog',
          description:
            'Repeated products with titles, prices, categories, links, and image placeholders.',
          signals: ['12 product cards', 'Repeated fields', 'Smart detection target'],
        },
        table: {
          badge: 'Structured rows',
          title: 'Community schedule table',
          description: 'A meaningful five-column schedule with eight records and mixed statuses.',
          signals: ['Semantic headers', '8 data rows', 'CSV-ready values'],
        },
        article: {
          badge: 'Editorial page',
          title: 'Field-notes article',
          description: 'Headings, paragraphs, metadata, a link, image description, and JSON-LD.',
          signals: ['Article metadata', 'Nested headings', 'JSON-LD'],
        },
      },
    },
    documents: {
      methodology: {
        eyebrow: 'How extraction works',
        title: 'A clear boundary between network access and document analysis.',
        summary:
          'The Worker performs a small security-sensitive fetch. The browser receives bounded static HTML, parses it in a detached document, and keeps general extraction work off the free backend.',
        calloutTitle: 'The core architecture rule',
        callout:
          'Fetched markup is never inserted into the live ScrapeStudio page. Analysis operates on a detached DOM and produces serializable data records.',
        sections: [
          {
            title: '1. Validate and fetch',
            body: [
              'The API accepts only HTTP or HTTPS URLs, rejects credentials and restricted destinations, and manually validates every redirect before following it.',
              'A single deadline, HTML-only content policy, redirect limit, response-size ceiling, and anonymous quota keep the public service bounded.',
            ],
          },
          {
            title: '2. Parse in a detached document',
            body: [
              'The browser uses DOMParser to create an isolated document. Quick extractors normalize tables, links, images, headings, metadata, and document statistics into typed envelopes.',
            ],
            points: [
              'No live DOM injection',
              'No server-side general DOM parsing',
              'Explicit result caps',
            ],
          },
          {
            title: '3. Add control only when needed',
            body: [
              'Users can switch to a multi-field CSS selector recipe. Smart repeated-structure analysis uses a compact snapshot and a time-limited Web Worker, then converts a suggestion into an editable recipe.',
            ],
          },
          {
            title: '4. Review and export',
            body: [
              'Results stay visible before export. JSON keeps stable keys, CSV neutralizes spreadsheet formulas, and generated starter code repeats the static-page and timeout boundaries.',
            ],
          },
        ],
      },
      security: {
        eyebrow: 'Security model',
        title: 'Treat every URL, redirect, response, and remote document as untrusted.',
        summary:
          'ScrapeStudio is intentionally narrower than a browser automation service. Its security controls are designed around fetching bounded public static HTML without exposing private networks or executing remote markup.',
        calloutTitle: 'Defense in depth',
        callout:
          'Application validation is paired with Cloudflare’s public-network fetch restriction. A runtime without an equivalent DNS and rebinding defense must not reuse the fetcher unchanged.',
        sections: [
          {
            title: 'Destination controls',
            body: [
              'Every initial URL and redirect target is normalized and independently checked.',
            ],
            points: [
              'HTTP and HTTPS only',
              'No embedded credentials',
              'No localhost, private, reserved, metadata, or nonstandard-port targets',
              'Manual redirect validation',
            ],
          },
          {
            title: 'Resource controls',
            body: [
              'One overall timeout covers the redirect chain. Response bytes are counted while streaming, only supported HTML content types are accepted, and public anonymous quotas limit repeated load.',
            ],
          },
          {
            title: 'Rendering controls',
            body: [
              'Remote HTML is parsed only in a detached document. Remote images are shown as text records, and sanitized HTML output is displayed as text rather than executed markup.',
            ],
          },
          {
            title: 'Explicitly unsupported',
            body: [
              'There is no credentialed scraping, CAPTCHA bypass, proxy rotation, private-page access, cookie import, arbitrary browser automation, or unlimited crawling.',
            ],
          },
        ],
      },
      limitations: {
        eyebrow: 'Product boundaries',
        title: 'Static HTML is a deliberate scope, not a promise to scrape every site.',
        summary:
          'The free public release is useful for ordinary public documents, catalogs, articles, and tables whose data exists in the original HTML response.',
        calloutTitle: 'Check the source page first',
        callout:
          'If meaningful content appears only after JavaScript runs, after login, or after user interaction, ScrapeStudio may return little or no useful data.',
        sections: [
          {
            title: 'Page limitations',
            body: [
              'The current release does not render remote JavaScript or maintain an authenticated browser session.',
            ],
            points: [
              'No client-rendered application state',
              'No login or private pages',
              'No CAPTCHA or anti-bot bypass',
              'No multi-page crawler',
            ],
          },
          {
            title: 'Extraction limitations',
            body: [
              'Table header inference, image source choice, and repeated-structure ranking are deterministic best-effort methods. Unusual markup can still require a custom selector or manual review.',
            ],
          },
          {
            title: 'Public-service limits',
            body: [
              'Timeouts, HTML-size limits, result caps, short-window quotas, and daily quotas protect the free shared service. A large page can be valid and still exceed those operational boundaries.',
            ],
          },
          {
            title: 'Generated code limitations',
            body: [
              'Starter code mirrors a saved static-page recipe. It is not a hosted job, scheduler, browser automation script, or guarantee that a source website will keep the same markup.',
            ],
          },
        ],
      },
      privacy: {
        eyebrow: 'Privacy and data handling',
        title: 'Keep user work local and remote HTML ephemeral.',
        summary:
          'ScrapeStudio does not require an account and has no server database for recipes, history, fetched pages, or extracted result rows.',
        calloutTitle: 'What remains on this device',
        callout:
          'Saved recipes and lightweight history use this browser’s IndexedDB. They can be exported, deleted, or cleared by the browser and do not automatically follow the user to another device.',
        sections: [
          {
            title: 'Across the network',
            body: [
              'The Worker receives the requested public URL and a locally generated anonymous client identifier, fetches the bounded page, and returns HTML plus operational metadata.',
            ],
          },
          {
            title: 'On the server',
            body: [
              'Fetched HTML is not persisted. Logs avoid full URLs with sensitive query strings, and anonymous rate-limit identity uses a deployment-specific salted hash instead of retaining raw IP addresses longer than needed.',
            ],
          },
          {
            title: 'In the browser',
            body: [
              'HTML and result rows are held only for the active workspace session. Recipes and lightweight history are bounded local records; history never contains fetched HTML or extracted rows.',
            ],
          },
          {
            title: 'Your controls',
            body: [
              'Users can export recipes as portable JSON, delete individual recipes, clear all extraction history, or clear site storage through browser settings.',
            ],
          },
        ],
      },
      'responsible-use': {
        eyebrow: 'Responsible use',
        title: 'Public availability does not remove context, ownership, or responsibility.',
        summary:
          'ScrapeStudio provides extraction tools, not permission to ignore source-site rules, copyright, privacy, database rights, or local law.',
        calloutTitle: 'The user makes the final decision',
        callout:
          'Before collecting or publishing data, confirm that your purpose, volume, retention, and reuse are appropriate for the source and the people represented in it.',
        sections: [
          {
            title: 'Use appropriate sources',
            body: [
              'Work with public pages you are allowed to access. Do not attempt to reach private content, bypass access controls, or repurpose ScrapeStudio for credentials or surveillance.',
            ],
          },
          {
            title: 'Keep collection proportionate',
            body: [
              'Request only the pages and fields you need, avoid unnecessary repetition, and respect robots guidance, terms, published API alternatives, and reasonable rate expectations.',
            ],
          },
          {
            title: 'Protect people and sensitive data',
            body: [
              'Avoid collecting personal or sensitive information without a legitimate basis. Minimize retention and review results before sharing, especially when automated selectors can include unintended fields.',
            ],
          },
          {
            title: 'Preserve context',
            body: [
              'Keep source references where appropriate, verify facts before reuse, and do not present extracted data as more current, complete, or authoritative than the original page supports.',
            ],
          },
        ],
      },
      about: {
        eyebrow: 'About the project',
        title: 'A serious, open tool for small and understandable extraction jobs.',
        summary:
          'ScrapeStudio is a bilingual no-code studio created for people who need structured data from supported public pages without creating an account or installing a scraping stack.',
        calloutTitle: 'Current public release',
        callout:
          'The project is free and open source. It deliberately contains no login, subscription, payment, premium plan, cloud account, or commercial billing system.',
        sections: [
          {
            title: 'Product principles',
            body: [
              'Security and reliability take priority over pretending every website is supported. Persian RTL and English LTR are both first-class product experiences, including on mobile.',
            ],
          },
          {
            title: 'Architecture',
            body: [
              'A React and TypeScript client owns detached parsing and user interaction. A Hono Cloudflare Worker owns bounded public fetches, and a Durable Object enforces anonymous quotas.',
            ],
          },
          {
            title: 'Local ownership',
            body: [
              'Recipes and lightweight history stay in IndexedDB. The server does not become an account database and does not store fetched HTML.',
            ],
          },
          {
            title: 'Open development',
            body: [
              'The repository includes implementation specifications, architecture notes, security tests, original fixtures, and a phased quality history so reviewers can inspect both the product and its engineering decisions.',
            ],
          },
        ],
      },
    },
    tools: {
      'table-extractor': {
        eyebrow: 'Quick tool guide',
        title: 'Turn semantic HTML tables into bounded rows and columns.',
        summary:
          'Table extraction normalizes captions, headers, spans, and body cells for review and export.',
        calloutTitle: 'Best fit',
        callout:
          'Use this tool when the source contains a real HTML table. Visually tabular div layouts may need a custom selector.',
        sections: [
          {
            title: 'Workflow',
            body: [
              'Load a supported page, choose Tables, inspect inferred headers, then export the reviewed records.',
            ],
            points: [
              'Bounded rows and columns',
              'Desktop table and mobile cards',
              'JSON and CSV export',
            ],
          },
        ],
      },
      'link-extractor': {
        eyebrow: 'Quick tool guide',
        title: 'Review normalized page links with useful classification.',
        summary:
          'Relative links are resolved against the final fetched URL and valid page base declarations.',
        calloutTitle: 'Safe preview',
        callout:
          'Links are presented as records. ScrapeStudio does not automatically crawl or visit every extracted destination.',
        sections: [
          {
            title: 'Workflow',
            body: [
              'Load a page, choose Links, review text and resolved destinations, then export only the records you need.',
            ],
            points: [
              'Relative URL resolution',
              'Internal and external classification',
              'No unlimited crawling',
            ],
          },
        ],
      },
      'image-extractor': {
        eyebrow: 'Quick tool guide',
        title: 'Extract image metadata without silently loading third-party media.',
        summary:
          'Image candidates include resolved sources, alt text, titles, and lazy-loading attributes where available.',
        calloutTitle: 'Privacy-aware preview',
        callout:
          'Remote image results are shown as text records so reviewing a page does not disclose another request to an image host.',
        sections: [
          {
            title: 'Workflow',
            body: [
              'Load a page, choose Images, inspect source and descriptive text, then export the metadata.',
            ],
            points: ['Text-only remote preview', 'Lazy-source recognition', 'Bounded results'],
          },
        ],
      },
      'metadata-extractor': {
        eyebrow: 'Quick tool guide',
        title: 'Inspect document metadata and structured data together.',
        summary:
          'Review title, description, canonical references, Open Graph values, favicons, and JSON-LD blocks.',
        calloutTitle: 'Remember',
        callout:
          'Metadata describes what a publisher claims about a page. It should still be verified before reuse.',
        sections: [
          {
            title: 'Workflow',
            body: [
              'Load a page, choose Metadata, compare document and social fields, then inspect structured JSON separately.',
            ],
            points: ['Document metadata', 'Open Graph and canonical fields', 'JSON-LD extraction'],
          },
        ],
      },
      'custom-selector': {
        eyebrow: 'Advanced tool guide',
        title: 'Build an editable multi-field recipe with CSS selectors.',
        summary:
          'Choose an item selector, define up to ten fields, inspect live match counts, and review rows before saving or exporting.',
        calloutTitle: 'Control with boundaries',
        callout:
          'Custom selectors operate on the detached static document and remain subject to item and multi-value caps.',
        sections: [
          {
            title: 'Workflow',
            body: [
              'Start from a detected repeated structure or enter selectors manually, choose extraction modes, add fallbacks, then run and review the recipe.',
            ],
            points: [
              'Eight extraction modes',
              'Independent field errors',
              'Local recipe persistence',
            ],
          },
        ],
      },
    },
  },
  fa: {
    common: {
      analyzeDemo: 'تحلیل این نمونه',
      backToDocs: 'بازگشت به مستندات',
      backToPlayground: 'همهٔ نمونه‌های Playground',
      documentationLabel: 'بخش‌های مستندات',
      openGuide: 'خواندن راهنمای ابزار',
      openPlayground: 'بازکردن صفحهٔ نمونه',
      playgroundLabel: 'نمونه‌های Playground',
      readDocument: 'خواندن این بخش',
    },
    docs: {
      eyebrow: 'مستندات محصول',
      title: 'پیش از اعتماد به نتیجه، روش کار را بشناسید.',
      description:
        'ScrapeStudio روشن توضیح می‌دهد چه کاری انجام می‌دهد، عمداً چه کارهایی را انجام نمی‌دهد و تصمیم نهایی کجا هنوز به بررسی انسان نیاز دارد.',
      noteTitle: 'مستندات بخشی از خود محصول است',
      note: 'کنترل‌های امنیتی، مرزهای حریم خصوصی، محدودیت‌های استخراج و انتظارهای استفادهٔ مسئولانه پشت متن‌های تبلیغاتی پنهان نشده‌اند.',
      items: {
        methodology: {
          title: 'روش‌شناسی',
          description: 'مسیر نشانی بررسی‌شده تا تحلیل جداشده و خروجی محدود را دنبال کنید.',
        },
        security: {
          title: 'امنیت',
          description: 'مدل تهدید دریافت، بررسی تغییر مسیر، سقف‌ها و مرز نمایش امن را ببینید.',
        },
        limitations: {
          title: 'محدودیت‌ها',
          description: 'بدانید نسخهٔ عمومی رایگان از چه صفحه‌ها و نتیجه‌هایی پشتیبانی می‌کند.',
        },
        privacy: {
          title: 'حریم خصوصی',
          description:
            'ببینید چه چیزی در مرورگر می‌ماند، چه چیزی از Worker می‌گذرد و چه چیزی ذخیره نمی‌شود.',
        },
        'responsible-use': {
          title: 'استفادهٔ مسئولانه',
          description: 'دادهٔ عمومی را با توجه به زمینه، قواعد منبع و اندازهٔ متناسب استفاده کنید.',
        },
        about: {
          title: 'دربارهٔ ScrapeStudio',
          description: 'با مأموریت، مرز معماری و دامنهٔ نسخهٔ متن‌باز آشنا شوید.',
        },
      },
    },
    playground: {
      eyebrow: 'Playground داخلی و محلی',
      title: 'بدون وابستگی به سایت دیگری، جریان کامل محصول را امتحان کنید.',
      description:
        'یک صفحهٔ تألیفی داخل پروژه را انتخاب کنید، ساختارش را ببینید و همان نمونه را بدون درخواست شبکه وارد فضای استخراج کنید.',
      localNoteTitle: 'عمداً قابل‌پیش‌بینی',
      localNote:
        'این صفحه‌ها دادهٔ اصلی خود پروژه هستند؛ سهمیهٔ دریافت عمومی مصرف نمی‌کنند، با شخص ثالث تماس نمی‌گیرند و میان اجرای تست‌ها ناگهان تغییر نمی‌کنند.',
      originalBadge: 'محتوای تألیفی داخل پروژه',
      pageDescription:
        'این صفحه یک نمونهٔ محلی و قابل‌مشاهده است. ساختار آن را ببینید و سپس همان HTML معنایی را در فضای استخراج تحلیل کنید.',
      demos: {
        products: {
          badge: 'کارت‌های تکرارشونده',
          title: 'کاتالوگ دوازده‌محصولی',
          description: 'محصول‌های تکراری با عنوان، قیمت، دسته‌بندی، لینک و جای‌نگهدار تصویر.',
          signals: ['۱۲ کارت محصول', 'فیلدهای تکرارشونده', 'مناسب تشخیص هوشمند'],
        },
        table: {
          badge: 'ردیف‌های ساخت‌یافته',
          title: 'جدول برنامهٔ محله',
          description: 'یک برنامهٔ پنج‌ستونه و معنادار با هشت رکورد و وضعیت‌های متفاوت.',
          signals: ['سرستون‌های معنایی', '۸ ردیف داده', 'آمادهٔ خروجی CSV'],
        },
        article: {
          badge: 'صفحهٔ تحریریه',
          title: 'مقالهٔ یادداشت میدانی',
          description: 'عنوان‌ها، بندها، فراداده، لینک، توضیح تصویر و JSON-LD.',
          signals: ['فرادادهٔ مقاله', 'عنوان‌های تو‌در‌تو', 'JSON-LD'],
        },
      },
    },
    documents: {
      methodology: {
        eyebrow: 'استخراج چگونه انجام می‌شود؟',
        title: 'مرزی روشن میان دسترسی شبکه و تحلیل سند.',
        summary:
          'Worker فقط دریافت کوچک و حساس به امنیت را انجام می‌دهد. مرورگر HTML ایستای محدود را در سندی جدا تحلیل می‌کند و پردازش عمومی DOM را روی Backend رایگان نمی‌گذارد.',
        calloutTitle: 'قاعدهٔ اصلی معماری',
        callout:
          'نشانه‌گذاری دریافت‌شده هرگز وارد صفحهٔ زندهٔ ScrapeStudio نمی‌شود. تحلیل روی DOM جدا انجام می‌شود و فقط رکوردهای داده‌ای قابل‌انتقال تولید می‌کند.',
        sections: [
          {
            title: '۱. بررسی و دریافت',
            body: [
              'API فقط HTTP و HTTPS را می‌پذیرد، اطلاعات ورود و مقصدهای محدود را رد می‌کند و هر تغییر مسیر را پیش از دنبال‌کردن دوباره بررسی می‌کند.',
              'مهلت کلی، پذیرش فقط HTML، سقف تغییر مسیر و اندازه و سهمیهٔ ناشناس سرویس عمومی را محدود نگه می‌دارند.',
            ],
          },
          {
            title: '۲. تحلیل در سند جدا',
            body: [
              'مرورگر با DOMParser یک سند ایزوله می‌سازد. استخراج‌گرهای سریع، جدول، لینک، تصویر، عنوان، فراداده و آمار سند را به خروجی‌های تایپ‌شده تبدیل می‌کنند.',
            ],
            points: [
              'بدون تزریق به DOM زنده',
              'بدون تحلیل عمومی DOM روی سرور',
              'سقف روشن برای نتیجه‌ها',
            ],
          },
          {
            title: '۳. کنترل بیشتر فقط هنگام نیاز',
            body: [
              'کاربر می‌تواند دستور CSS چندفیلدی بسازد. تشخیص ساختار تکراری یک Snapshot کوچک را در Web Worker زمان‌دار بررسی می‌کند و پیشنهادش را به دستور قابل‌ویرایش تبدیل می‌کند.',
            ],
          },
          {
            title: '۴. بررسی و خروجی',
            body: [
              'نتیجه پیش از خروجی دیده می‌شود. JSON کلیدهای پایدار دارد، CSV فرمول‌های صفحه‌گسترده را خنثی می‌کند و کد شروع مرز صفحهٔ ایستا و Timeout را حفظ می‌کند.',
            ],
          },
        ],
      },
      security: {
        eyebrow: 'مدل امنیتی',
        title: 'هر نشانی، تغییر مسیر، پاسخ و سند راه‌دور غیرقابل‌اعتماد است.',
        summary:
          'ScrapeStudio عمداً از سرویس اتوماسیون مرورگر محدودتر است. کنترل‌ها برای دریافت HTML ایستای عمومی طراحی شده‌اند؛ بدون دسترسی به شبکهٔ خصوصی و بدون اجرای نشانه‌گذاری راه‌دور.',
        calloutTitle: 'دفاع چندلایه',
        callout:
          'اعتبارسنجی برنامه با محدودیت دریافت شبکهٔ عمومی Cloudflare همراه است. Runtime دیگری بدون دفاع معادل در برابر DNS و Rebinding نباید همین Fetcher را بدون تغییر استفاده کند.',
        sections: [
          {
            title: 'کنترل مقصد',
            body: ['نشانی اولیه و هر مقصد تغییر مسیر، مستقل و کامل بررسی می‌شوند.'],
            points: [
              'فقط HTTP و HTTPS',
              'بدون اطلاعات ورود داخل URL',
              'مسدودسازی localhost، شبکهٔ خصوصی، مقصدهای رزروشده و Metadata',
              'بررسی دستی تغییر مسیر',
            ],
          },
          {
            title: 'کنترل منابع',
            body: [
              'یک مهلت کلی تمام زنجیره را پوشش می‌دهد؛ بایت‌ها هنگام Stream شمرده می‌شوند، فقط Content-Type پشتیبانی‌شده پذیرفته می‌شود و سهمیهٔ ناشناس بار تکراری را محدود می‌کند.',
            ],
          },
          {
            title: 'کنترل نمایش',
            body: [
              'HTML فقط در سند جدا تحلیل می‌شود. تصاویر راه‌دور به‌شکل رکورد متنی دیده می‌شوند و خروجی HTML پاک‌سازی‌شده نیز به‌صورت متن نمایش داده می‌شود.',
            ],
          },
          {
            title: 'موارد صریحاً پشتیبانی‌نشده',
            body: [
              'استخراج دارای اطلاعات ورود، دورزدن CAPTCHA، چرخش Proxy، صفحهٔ خصوصی، واردکردن Cookie، اتوماسیون دلخواه مرورگر و Crawl نامحدود وجود ندارد.',
            ],
          },
        ],
      },
      limitations: {
        eyebrow: 'مرزهای محصول',
        title: 'HTML ایستا یک دامنهٔ آگاهانه است، نه وعدهٔ استخراج از هر سایت.',
        summary:
          'نسخهٔ عمومی رایگان برای سندها، کاتالوگ‌ها، مقاله‌ها و جدول‌هایی مفید است که دادهٔ آن‌ها در پاسخ HTML اولیه وجود دارد.',
        calloutTitle: 'ابتدا صفحهٔ منبع را بررسی کنید',
        callout:
          'اگر محتوای اصلی فقط بعد از اجرای JavaScript، ورود یا تعامل کاربر ظاهر شود، ScrapeStudio ممکن است دادهٔ مفیدی پیدا نکند.',
        sections: [
          {
            title: 'محدودیت صفحه',
            body: [
              'نسخهٔ فعلی JavaScript راه‌دور را Render نمی‌کند و نشست مرورگر احراز هویت‌شده ندارد.',
            ],
            points: [
              'بدون state اپلیکیشن Client-rendered',
              'بدون ورود و صفحهٔ خصوصی',
              'بدون دورزدن CAPTCHA یا Anti-bot',
              'بدون Crawler چندصفحه‌ای',
            ],
          },
          {
            title: 'محدودیت استخراج',
            body: [
              'تشخیص سرستون جدول، انتخاب منبع تصویر و رتبه‌بندی ساختار تکراری روش‌های قطعی اما best-effort هستند. نشانه‌گذاری نامعمول ممکن است به Selector سفارشی یا بررسی دستی نیاز داشته باشد.',
            ],
          },
          {
            title: 'سقف‌های سرویس عمومی',
            body: [
              'Timeout، سقف اندازهٔ HTML و نتیجه، سهمیهٔ کوتاه‌مدت و روزانه از سرویس رایگان مشترک محافظت می‌کنند. یک صفحه می‌تواند معتبر باشد اما از این مرزها عبور کند.',
            ],
          },
          {
            title: 'محدودیت کد تولیدشده',
            body: [
              'کد شروع فقط یک دستور صفحهٔ ایستا را بازسازی می‌کند؛ Job میزبانی‌شده، Scheduler، اتوماسیون مرورگر یا تضمین ثبات HTML سایت منبع نیست.',
            ],
          },
        ],
      },
      privacy: {
        eyebrow: 'حریم خصوصی و مدیریت داده',
        title: 'کار کاربر محلی و HTML راه‌دور موقتی می‌ماند.',
        summary:
          'ScrapeStudio حساب کاربری نمی‌خواهد و هیچ پایگاه دادهٔ سروری برای دستورها، تاریخچه، صفحه‌های دریافت‌شده یا ردیف‌های نتیجه ندارد.',
        calloutTitle: 'چیزی که روی همین دستگاه می‌ماند',
        callout:
          'دستورهای ذخیره‌شده و تاریخچهٔ سبک در IndexedDB همین مرورگر هستند. می‌توان آن‌ها را خروجی گرفت یا حذف کرد و خودکار به دستگاه دیگر منتقل نمی‌شوند.',
        sections: [
          {
            title: 'در شبکه',
            body: [
              'Worker نشانی عمومی و شناسهٔ ناشناس تولیدشده در مرورگر را دریافت می‌کند، صفحهٔ محدود را می‌گیرد و HTML را همراه اطلاعات عملیاتی برمی‌گرداند.',
            ],
          },
          {
            title: 'روی سرور',
            body: [
              'HTML دریافت‌شده ذخیره نمی‌شود. Logها URL کامل دارای Query حساس را نگه نمی‌دارند و هویت سهمیه با Salt مخصوص Deploy هش می‌شود.',
            ],
          },
          {
            title: 'داخل مرورگر',
            body: [
              'HTML و ردیف‌های نتیجه فقط برای نشست فعال Workspace نگه داشته می‌شوند. تاریخچه هرگز HTML دریافت‌شده یا ردیف‌های استخراج‌شده را ذخیره نمی‌کند.',
            ],
          },
          {
            title: 'کنترل شما',
            body: [
              'کاربر می‌تواند دستورها را JSON بگیرد، دستورها را جداگانه حذف کند، تاریخچه را کامل پاک کند یا دادهٔ سایت را از تنظیمات مرورگر حذف کند.',
            ],
          },
        ],
      },
      'responsible-use': {
        eyebrow: 'استفادهٔ مسئولانه',
        title: 'عمومی‌بودن، زمینه، مالکیت و مسئولیت را حذف نمی‌کند.',
        summary:
          'ScrapeStudio ابزار استخراج می‌دهد؛ نه مجوز نادیده‌گرفتن قواعد سایت منبع، حق مؤلف، حریم خصوصی، حقوق پایگاه داده یا قانون محلی.',
        calloutTitle: 'تصمیم نهایی با کاربر است',
        callout:
          'پیش از جمع‌آوری یا انتشار، مطمئن شوید هدف، حجم، مدت نگهداری و استفادهٔ دوباره با منبع و افرادی که داده دربارهٔ آن‌هاست تناسب دارد.',
        sections: [
          {
            title: 'منبع مناسب انتخاب کنید',
            body: [
              'فقط با صفحه‌های عمومی که اجازهٔ دسترسی دارید کار کنید. برای محتوای خصوصی، دورزدن کنترل دسترسی، Credential یا نظارت از ابزار استفاده نکنید.',
            ],
          },
          {
            title: 'جمع‌آوری را متناسب نگه دارید',
            body: [
              'فقط صفحه و فیلد لازم را بخواهید، تکرار اضافی نداشته باشید و robots، شرایط استفاده، API رسمی و نرخ منطقی منبع را رعایت کنید.',
            ],
          },
          {
            title: 'از افراد و دادهٔ حساس محافظت کنید',
            body: [
              'بدون مبنای موجه اطلاعات شخصی یا حساس جمع نکنید. نگهداری را کمینه کنید و پیش از اشتراک‌گذاری، فیلدهای ناخواسته را بررسی کنید.',
            ],
          },
          {
            title: 'زمینه را حفظ کنید',
            body: [
              'هرجا لازم است منبع را نگه دارید، واقعیت‌ها را پیش از استفاده دوباره بسنجید و داده را کامل‌تر یا تازه‌تر از چیزی که منبع پشتیبانی می‌کند نشان ندهید.',
            ],
          },
        ],
      },
      about: {
        eyebrow: 'دربارهٔ پروژه',
        title: 'ابزاری جدی و متن‌باز برای استخراج‌های کوچک و قابل‌فهم.',
        summary:
          'ScrapeStudio یک استودیوی دوزبانه و بدون کدنویسی برای تبدیل دادهٔ صفحه‌های عمومی پشتیبانی‌شده است؛ بدون ساخت حساب و نصب پشتهٔ Scraping.',
        calloutTitle: 'نسخهٔ عمومی فعلی',
        callout:
          'پروژه رایگان و متن‌باز است و عمداً هیچ Login، Subscription، Payment، Premium Plan، حساب Cloud یا Billing تجاری ندارد.',
        sections: [
          {
            title: 'اصول محصول',
            body: [
              'امنیت و قابل‌اعتمادبودن مهم‌تر از ادعای پشتیبانی از هر سایت است. فارسی RTL و انگلیسی LTR، از جمله روی موبایل، هر دو تجربهٔ درجه‌یک هستند.',
            ],
          },
          {
            title: 'معماری',
            body: [
              'کلاینت React و TypeScript تحلیل جدا و تعامل کاربر را انجام می‌دهد. Worker مبتنی بر Hono دریافت محدود عمومی را انجام می‌دهد و Durable Object سهمیهٔ ناشناس را نگه می‌دارد.',
            ],
          },
          {
            title: 'مالکیت محلی',
            body: [
              'دستورها و تاریخچهٔ سبک در IndexedDB می‌مانند. سرور به پایگاه دادهٔ حساب تبدیل نمی‌شود و HTML دریافت‌شده را ذخیره نمی‌کند.',
            ],
          },
          {
            title: 'توسعهٔ باز',
            body: [
              'مخزن شامل Specification، یادداشت معماری، تست امنیت، Fixtureهای اصلی و تاریخچهٔ کیفیت مرحله‌ای است تا محصول و تصمیم‌های مهندسی هر دو قابل‌بررسی باشند.',
            ],
          },
        ],
      },
    },
    tools: {
      'table-extractor': {
        eyebrow: 'راهنمای ابزار سریع',
        title: 'جدول معنایی HTML را به ردیف و ستون محدود تبدیل کنید.',
        summary:
          'استخراج جدول Caption، سرستون، Span و سلول‌های بدنه را برای بررسی و خروجی یکدست می‌کند.',
        calloutTitle: 'بهترین کاربرد',
        callout:
          'وقتی منبع یک جدول واقعی HTML دارد از این ابزار استفاده کنید؛ چیدمان‌های جدولی با div ممکن است Selector سفارشی بخواهند.',
        sections: [
          {
            title: 'جریان کار',
            body: [
              'صفحه را دریافت کنید، «جدول‌ها» را انتخاب کنید، سرستون‌های تشخیص‌داده‌شده را بسنجید و رکوردهای تأییدشده را خروجی بگیرید.',
            ],
            points: ['ردیف و ستون محدود', 'جدول دسکتاپ و کارت موبایل', 'خروجی JSON و CSV'],
          },
        ],
      },
      'link-extractor': {
        eyebrow: 'راهنمای ابزار سریع',
        title: 'لینک‌های یکدست‌شدهٔ صفحه را با دسته‌بندی مفید ببینید.',
        summary: 'لینک نسبی بر پایهٔ نشانی نهایی صفحه و base معتبر به نشانی کامل تبدیل می‌شود.',
        calloutTitle: 'پیش‌نمایش امن',
        callout:
          'لینک‌ها فقط به‌شکل رکورد دیده می‌شوند؛ ScrapeStudio خودکار همهٔ مقصدها را Crawl یا باز نمی‌کند.',
        sections: [
          {
            title: 'جریان کار',
            body: [
              'صفحه را دریافت کنید، «لینک‌ها» را انتخاب کنید، متن و مقصد نهایی را ببینید و فقط رکورد لازم را خروجی بگیرید.',
            ],
            points: ['تبدیل URL نسبی', 'تشخیص داخلی و خارجی', 'بدون Crawl نامحدود'],
          },
        ],
      },
      'image-extractor': {
        eyebrow: 'راهنمای ابزار سریع',
        title: 'فرادادهٔ تصویر را بدون بارگذاری پنهانی رسانهٔ شخص ثالث استخراج کنید.',
        summary: 'منبع یکدست‌شده، alt، title و ویژگی‌های Lazy در صورت وجود استخراج می‌شوند.',
        calloutTitle: 'پیش‌نمایش حریم‌خصوصی‌محور',
        callout:
          'تصاویر راه‌دور به‌شکل رکورد متنی هستند تا بررسی نتیجه درخواست تازه‌ای به میزبان تصویر نفرستد.',
        sections: [
          {
            title: 'جریان کار',
            body: [
              'صفحه را دریافت کنید، «تصاویر» را انتخاب کنید، منبع و متن توصیفی را ببینید و فراداده را خروجی بگیرید.',
            ],
            points: ['پیش‌نمایش متنی', 'تشخیص Lazy source', 'نتیجهٔ محدود'],
          },
        ],
      },
      'metadata-extractor': {
        eyebrow: 'راهنمای ابزار سریع',
        title: 'فرادادهٔ سند و دادهٔ ساخت‌یافته را کنار هم بررسی کنید.',
        summary: 'عنوان، توضیح، canonical، Open Graph، favicon و JSON-LD را ببینید.',
        calloutTitle: 'به یاد داشته باشید',
        callout:
          'فراداده ادعای ناشر دربارهٔ صفحه است و پیش از استفادهٔ دوباره همچنان باید سنجیده شود.',
        sections: [
          {
            title: 'جریان کار',
            body: [
              'صفحه را دریافت کنید، «فراداده» را انتخاب کنید، فیلدهای سند و شبکهٔ اجتماعی را مقایسه و JSON ساخت‌یافته را جدا بررسی کنید.',
            ],
            points: ['فرادادهٔ سند', 'Open Graph و canonical', 'استخراج JSON-LD'],
          },
        ],
      },
      'custom-selector': {
        eyebrow: 'راهنمای ابزار پیشرفته',
        title: 'با CSS Selector یک دستور چندفیلدی و قابل‌ویرایش بسازید.',
        summary:
          'Item selector را تعیین کنید، تا ده فیلد بسازید، تعداد Match را زنده ببینید و ردیف‌ها را پیش از ذخیره بررسی کنید.',
        calloutTitle: 'کنترل همراه با سقف',
        callout:
          'Selector سفارشی روی سند ایستای جدا اجرا می‌شود و سقف Item و چندمقداری را حفظ می‌کند.',
        sections: [
          {
            title: 'جریان کار',
            body: [
              'از ساختار تکراری پیشنهادی شروع کنید یا Selector را دستی بدهید، حالت استخراج و fallback را تنظیم کنید و بعد نتیجه را بسنجید.',
            ],
            points: ['هشت حالت استخراج', 'خطای مستقل هر فیلد', 'ذخیرهٔ محلی دستور'],
          },
        ],
      },
    },
  },
};
