import type { SupportedLocale } from '@scrapestudio/shared';

export const PLAYGROUND_KINDS = ['products', 'table', 'article'] as const;

export type PlaygroundKind = (typeof PLAYGROUND_KINDS)[number];

export interface DemoProduct {
  category: string;
  id: string;
  price: string;
  title: string;
}

export interface DemoScheduleRow {
  capacity: string;
  format: string;
  session: string;
  status: string;
  time: string;
}

interface PlaygroundCopy {
  article: {
    author: string;
    description: string;
    imageAlt: string;
    kicker: string;
    publishedLabel: string;
    publishedValue: string;
    sections: ReadonlyArray<{ heading: string; paragraphs: readonly string[] }>;
    title: string;
  };
  products: {
    description: string;
    imageLabel: string;
    linkLabel: string;
    title: string;
  };
  table: {
    caption: string;
    description: string;
    headers: readonly string[];
    title: string;
  };
}

function createProducts(
  rows: ReadonlyArray<readonly [string, string, string, string]>,
): readonly DemoProduct[] {
  return rows.map(([id, title, category, price]) => ({
    category,
    id,
    price,
    title,
  }));
}

function createSchedule(
  rows: ReadonlyArray<readonly [string, string, string, string, string]>,
): readonly DemoScheduleRow[] {
  return rows.map(([session, time, format, capacity, status]) => ({
    capacity,
    format,
    session,
    status,
    time,
  }));
}

const products: Record<SupportedLocale, readonly DemoProduct[]> = {
  en: createProducts([
    ['field-journal', 'Field journal', 'Stationery', '$18'],
    ['canvas-map-case', 'Canvas map case', 'Travel', '$34'],
    ['brass-compass', 'Brass compass', 'Navigation', '$42'],
    ['trail-mug', 'Enamel trail mug', 'Camp kitchen', '$16'],
    ['pocket-lantern', 'Pocket lantern', 'Lighting', '$29'],
    ['wool-blanket', 'Wool camp blanket', 'Shelter', '$74'],
    ['utility-rope', 'Utility rope', 'Equipment', '$22'],
    ['herb-tin', 'Wild herb tin', 'Camp kitchen', '$12'],
    ['rain-cape', 'Packable rain cape', 'Clothing', '$48'],
    ['repair-kit', 'Field repair kit', 'Equipment', '$27'],
    ['solar-radio', 'Hand-crank radio', 'Electronics', '$58'],
    ['trail-flask', 'Steel trail flask', 'Travel', '$24'],
  ]),
  fa: createProducts([
    ['field-journal', 'دفترچهٔ میدانی', 'نوشت‌افزار', '۱۸ دلار'],
    ['canvas-map-case', 'کیف برزنتی نقشه', 'سفر', '۳۴ دلار'],
    ['brass-compass', 'قطب‌نمای برنجی', 'مسیریابی', '۴۲ دلار'],
    ['trail-mug', 'ماگ لعابی سفر', 'آشپزخانهٔ سفر', '۱۶ دلار'],
    ['pocket-lantern', 'فانوس جیبی', 'روشنایی', '۲۹ دلار'],
    ['wool-blanket', 'پتوی پشمی کمپ', 'سرپناه', '۷۴ دلار'],
    ['utility-rope', 'طناب چندمنظوره', 'تجهیزات', '۲۲ دلار'],
    ['herb-tin', 'قوطی گیاهان کوهی', 'آشپزخانهٔ سفر', '۱۲ دلار'],
    ['rain-cape', 'شنل بارانی جمع‌شونده', 'پوشاک', '۴۸ دلار'],
    ['repair-kit', 'کیت تعمیر میدانی', 'تجهیزات', '۲۷ دلار'],
    ['solar-radio', 'رادیوی هندلی', 'الکترونیک', '۵۸ دلار'],
    ['trail-flask', 'قمقمهٔ فولادی', 'سفر', '۲۴ دلار'],
  ]),
};

const scheduleRows: Record<SupportedLocale, readonly DemoScheduleRow[]> = {
  en: createSchedule([
    ['Repairing everyday objects', 'Sat · 09:30', 'Studio', '14', 'Open'],
    ['Urban field sketching', 'Sat · 11:00', 'Courtyard', '18', 'Open'],
    ['Reading a paper map', 'Sat · 14:00', 'Workshop', '12', 'Few seats'],
    ['Making natural ink', 'Sun · 09:00', 'Studio', '10', 'Full'],
    ['Introduction to seed saving', 'Sun · 10:30', 'Garden', '20', 'Open'],
    ['Documenting oral histories', 'Sun · 13:00', 'Library', '16', 'Few seats'],
    ['Night-sky orientation', 'Sun · 19:30', 'Rooftop', '24', 'Open'],
    ['Building a personal archive', 'Mon · 16:00', 'Library', '15', 'Open'],
  ]),
  fa: createSchedule([
    ['تعمیر وسایل روزمره', 'شنبه · ۹:۳۰', 'کارگاه', '۱۴', 'ثبت‌نام باز'],
    ['طراحی میدانی در شهر', 'شنبه · ۱۱:۰۰', 'حیاط', '۱۸', 'ثبت‌نام باز'],
    ['خواندن نقشهٔ کاغذی', 'شنبه · ۱۴:۰۰', 'کارگاه', '۱۲', 'چند جای خالی'],
    ['ساخت جوهر طبیعی', 'یکشنبه · ۹:۰۰', 'استودیو', '۱۰', 'تکمیل ظرفیت'],
    ['آشنایی با نگهداری بذر', 'یکشنبه · ۱۰:۳۰', 'باغ', '۲۰', 'ثبت‌نام باز'],
    ['ثبت تاریخ شفاهی', 'یکشنبه · ۱۳:۰۰', 'کتابخانه', '۱۶', 'چند جای خالی'],
    ['مسیریابی با آسمان شب', 'یکشنبه · ۱۹:۳۰', 'بام', '۲۴', 'ثبت‌نام باز'],
    ['ساخت آرشیو شخصی', 'دوشنبه · ۱۶:۰۰', 'کتابخانه', '۱۵', 'ثبت‌نام باز'],
  ]),
};

const copy: Record<SupportedLocale, PlaygroundCopy> = {
  en: {
    products: {
      description:
        'Twelve original product cards with repeated fields, links, categories, prices, and image placeholders.',
      imageLabel: 'Illustrated placeholder for',
      linkLabel: 'View field note',
      title: 'Field Notes Supply Co.',
    },
    table: {
      caption: 'Community field-school schedule',
      description:
        'A compact but meaningful schedule designed to test table headers, rows, statuses, and mixed text values.',
      headers: ['Session', 'Time', 'Place', 'Capacity', 'Status'],
      title: 'Neighbourhood Field School',
    },
    article: {
      author: 'Mina Arvand',
      description:
        'An original long-form sample containing metadata, headings, paragraphs, links, an image, and JSON-LD.',
      imageAlt: 'A field notebook beside a folded map and a small compass',
      kicker: 'Field practice · 7 minute read',
      publishedLabel: 'Published',
      publishedValue: '14 July 2026',
      title: 'How to keep useful field notes without collecting too much',
      sections: [
        {
          heading: 'Begin with a question, not a blank page',
          paragraphs: [
            'A useful note starts with a small decision: what will this observation help you understand later? That question keeps the page focused and makes review faster.',
            'Record the source, the moment, and the context before adding interpretation. A short factual line is often more valuable than a page of uncertain detail.',
          ],
        },
        {
          heading: 'Separate observation from interpretation',
          paragraphs: [
            'Use one visual marker for what you directly saw and another for what you inferred. The distinction makes a notebook trustworthy when memory becomes less precise.',
            'If a detail belongs to someone else, collect only what is necessary and ask before publishing it. Good documentation includes respectful boundaries.',
          ],
        },
        {
          heading: 'Review while the context is still fresh',
          paragraphs: [
            'Spend five minutes at the end of the day naming the page, adding two useful tags, and writing the next question. Small reviews prevent a notebook from becoming an unread archive.',
            'A compact index is enough. The goal is not to capture everything; it is to make the few valuable observations findable again.',
          ],
        },
      ],
    },
  },
  fa: {
    products: {
      description:
        'دوازده کارت محصول اصلی با فیلدهای تکرارشونده، لینک، دسته‌بندی، قیمت و جای‌نگهدار تصویر.',
      imageLabel: 'جای‌نگهدار تصویری برای',
      linkLabel: 'دیدن یادداشت محصول',
      title: 'فروشگاه یادداشت‌های میدانی',
    },
    table: {
      caption: 'برنامهٔ مدرسهٔ میدانی محله',
      description:
        'یک برنامهٔ کوچک اما معنادار برای آزمودن سرستون‌ها، ردیف‌ها، وضعیت‌ها و مقدارهای متنی متفاوت.',
      headers: ['جلسه', 'زمان', 'محل', 'ظرفیت', 'وضعیت'],
      title: 'مدرسهٔ میدانی محله',
    },
    article: {
      author: 'مینا اروند',
      description:
        'یک مقالهٔ تألیفی شامل فراداده، عنوان‌ها، بندها، لینک، تصویر و دادهٔ ساخت‌یافتهٔ JSON-LD.',
      imageAlt: 'دفترچهٔ میدانی کنار نقشهٔ تاشده و قطب‌نمای کوچک',
      kicker: 'تمرین میدانی · ۷ دقیقه مطالعه',
      publishedLabel: 'تاریخ انتشار',
      publishedValue: '۲۳ تیر ۱۴۰۵',
      title: 'چطور بدون جمع‌کردن اطلاعات اضافی، یادداشت میدانی مفید بنویسیم؟',
      sections: [
        {
          heading: 'به‌جای صفحهٔ سفید، با یک سؤال شروع کنید',
          paragraphs: [
            'یک یادداشت مفید با تصمیمی کوچک آغاز می‌شود: این مشاهده قرار است بعداً به فهم چه چیزی کمک کند؟ همین سؤال صفحه را متمرکز و مرور آن را ساده‌تر می‌کند.',
            'پیش از تفسیر، منبع، زمان و زمینه را ثبت کنید. یک خط کوتاه و دقیق اغلب از یک صفحه جزئیات نامطمئن ارزشمندتر است.',
          ],
        },
        {
          heading: 'مشاهده را از برداشت شخصی جدا کنید',
          paragraphs: [
            'برای چیزی که مستقیم دیده‌اید یک نشانه و برای برداشت خودتان نشانه‌ای دیگر بگذارید. وقتی حافظه کم‌دقت‌تر می‌شود، این مرزبندی دفترچه را قابل‌اعتماد نگه می‌دارد.',
            'اگر جزئیاتی به فرد دیگری مربوط است، فقط مقدار ضروری را ثبت کنید و پیش از انتشار اجازه بگیرید. مستندسازی خوب، مرز محترمانه هم دارد.',
          ],
        },
        {
          heading: 'تا زمینه تازه است، یادداشت را مرور کنید',
          paragraphs: [
            'پایان روز پنج دقیقه برای نام‌گذاری صفحه، افزودن دو برچسب مفید و نوشتن سؤال بعدی کافی است. مرورهای کوچک نمی‌گذارند دفترچه به آرشیوی ناخوانا تبدیل شود.',
            'یک نمایهٔ جمع‌وجور کافی است. هدف ثبت همه‌چیز نیست؛ هدف این است که چند مشاهدهٔ ارزشمند دوباره پیدا شوند.',
          ],
        },
      ],
    },
  },
};

export function isPlaygroundKind(value: string | null | undefined): value is PlaygroundKind {
  return PLAYGROUND_KINDS.includes(value as PlaygroundKind);
}

export function getPlaygroundCopy(locale: SupportedLocale): PlaygroundCopy {
  return copy[locale];
}

export function getDemoProducts(locale: SupportedLocale): readonly DemoProduct[] {
  return products[locale];
}

export function getDemoSchedule(locale: SupportedLocale): readonly DemoScheduleRow[] {
  return scheduleRows[locale];
}
