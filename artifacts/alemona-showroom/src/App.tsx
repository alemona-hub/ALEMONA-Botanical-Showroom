import { useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, ChevronUp, Menu, X, MapPin, Maximize2 } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient();

const asset = (name: string) => `/assets/${name}`;
const assets = {
  hero: asset('MEITU_20260921_195511942_1790459534600.jpg'),
  still: asset('20260921_175357_1790459534656.jpg'),
  caps: asset('20260921_175442_1790459534647.jpg'),
  macro: asset('20260921_175624_1790459534640.jpg'),
  pour: asset('IMG_20260921_201848_407_1790459534610.jpg'),
  logo: asset('IMG-20260924-WA0000_1790459534526.jpg'),
  shampooLabel: asset('IMG-20260921-WA0001_1790459534482.jpg'),
  conditionerLabel: asset('IMG-20260921-WA0002_1790459534515.jpg'),
};

type ProductKey = 'shampoo' | 'conditioner';
type Language = 'EN' | 'TR' | 'AR';
type TabKey = 'overview' | 'texture' | 'ingredients' | 'use';

const productData: Record<ProductKey, {
  name: string; size: string; subtitle: string; description: string; images: string[]; tags: string[];
  texture: { consistency: string; scent: string; feelLabel: string; feel: string; copy: string };
  ingredients: { title: string; body: string }[];
  use: string[];
}> = {
  shampoo: {
    name: 'Almond Tar Shampoo',
    size: '350 ml',
    subtitle: 'For Softer & Stronger Hair',
    description: 'A premium natural shampoo specifically created for complete hair and scalp care. Enriched with pure almond tar, juniper wood oil, and essential vitamins to nourish hair roots, eliminate dandruff, relieve scalp itchiness, and help protect hair against breakage.',
    images: [assets.hero, assets.still, assets.caps, assets.macro, assets.pour],
    tags: ['100% Vegan', 'Anti-Dandruff', 'Color-Safe', 'Pure Almond Tar'],
    texture: { consistency: 'Liquid Amber Honey', scent: 'Natural Botanical Almond & Herbal Refreshment', feelLabel: 'Scalp Feel', feel: 'Soothing · Cooling · Non-Greasy', copy: 'A translucent, amber-gold formula captured in motion — fluid, warm and designed to meet the scalp with a clean, refreshing touch.' },
    ingredients: [
      { title: 'Pure Almond Tar & Juniper Wood Oil', body: 'Targets dandruff, soothes the scalp, and supports a balanced scalp environment.' },
      { title: 'Sweet Almond & Castor Oil', body: 'Helps nourish and strengthen the hair fiber.' },
      { title: 'Coconut & Olive Fruit Oil', body: 'Helps maintain moisture and softness.' },
      { title: 'Vitamin E & Panthenol', body: 'Helps support elasticity, softness, and protection against dryness.' },
    ],
    use: ['Apply a suitable amount on wet hair, massaging gently into the scalp and hair.', 'Massage for 3–5 minutes to let the formula work through the roots.', 'Rinse thoroughly.'],
  },
  conditioner: {
    name: 'Hair Conditioner',
    size: '350 ml',
    subtitle: 'With Natural Oils & Vitamin E',
    description: 'A deeply restorative conditioner designed for all hair types. Enriched with Vitamin E and a rich blend of 7 natural botanical oils — Shea, Coconut, Almond, Castor, Black Seed, Grape Seed, and Onion Seed — to help repair damaged strands, reduce tangles, and impart a silky shine.',
    images: [assets.hero, assets.still, assets.macro, assets.caps, assets.conditionerLabel],
    tags: ['100% Vegan', '7 Natural Oils', 'Hair Repair', 'Tangle-Free'],
    texture: { consistency: 'Rich Velvet Cream', scent: 'Soft Botanical & Natural Oils', feelLabel: 'Hair Feel', feel: 'Silky · Nourishing · Smooth', copy: 'A rich, warm finish inspired by the conditioner’s terracotta packaging — designed to smooth through lengths and leave the hair feeling supple.' },
    ingredients: [
      { title: 'Shea Butter & Coconut Oil', body: 'Deep nourishment for dry and brittle lengths.' },
      { title: 'Black Seed & Grape Seed Oil', body: 'Rich botanical oils that help support softness and natural shine.' },
      { title: 'Onion Seed & Rosemary Extract', body: 'Botanical ingredients traditionally used in hair-care formulas to support the appearance and strength of the hair.' },
    ],
    use: ['Apply to the palm and rub hands together.', 'Distribute evenly through wet hair, focusing on the mid-lengths and ends.', 'Leave for 2–3 minutes, then rinse.'],
  },
};

const copy = {
  EN: { collection: 'The collection', collectionSub: 'Two considered formulas. One botanical point of view.', explore: 'Explore the collection', discover: 'Discover the formulas', philosophy: 'The Alemona philosophy', find: 'Find a store', overview: 'Overview', texture: 'Texture', ingredients: 'Ingredients', use: 'How to use', more: 'Explore formula' },
  TR: { collection: 'Koleksiyon', collectionSub: 'İki özenli formül. Tek bir botanik bakış.', explore: 'Koleksiyonu keşfet', discover: 'Formülleri keşfet', philosophy: 'Alemona felsefesi', find: 'Mağaza bul', overview: 'Genel bakış', texture: 'Doku', ingredients: 'İçindekiler', use: 'Kullanım', more: 'Formülü keşfet' },
  AR: { collection: 'المجموعة', collectionSub: 'تركيبتان مدروستان. رؤية نباتية واحدة.', explore: 'اكتشف المجموعة', discover: 'اكتشف التركيبات', philosophy: 'فلسفة أليمونا', find: 'اعثر على متجر', overview: 'نظرة عامة', texture: 'الملمس', ingredients: 'المكونات', use: 'طريقة الاستخدام', more: 'اكتشف التركيبة' },
};

function App() {
  const [language, setLanguage] = useState<Language>('EN');
  const [selectedProduct, setSelectedProduct] = useState<ProductKey | null>(null);
  const [tab, setTab] = useState<TabKey>('overview');
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [textureOpen, setTextureOpen] = useState(false);
  const [openIngredient, setOpenIngredient] = useState(0);
  const [inciOpen, setInciOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [kiosk, setKiosk] = useState(false);
  const [deskOpen, setDeskOpen] = useState(false);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const t = copy[language];
  const product = selectedProduct ? productData[selectedProduct] : null;
  const direction = language === 'AR' ? 'rtl' : 'ltr';

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileMenu(false);
  };
  const openProduct = (key: ProductKey) => {
    setSelectedProduct(key);
    setTab('overview');
    setGalleryIndex(0);
    setOpenIngredient(0);
    requestAnimationFrame(() => goTo('detail'));
  };
  const resetShowroom = () => {
    setSelectedProduct(null);
    setTextureOpen(false);
    setDeskOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(resetShowroom, 60000);
    };
    const events = ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'scroll'];
    events.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, []);

  const gallery = useMemo(() => product?.images ?? [], [product]);
  const selectLanguage = (next: Language) => {
    setLanguage(next);
    document.documentElement.lang = next === 'AR' ? 'ar' : next === 'TR' ? 'tr' : 'en';
    document.documentElement.dir = next === 'AR' ? 'rtl' : 'ltr';
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary resetKey={selectedProduct ?? 'home'}>
          <main className={`showroom ${kiosk ? 'kiosk' : ''}`} dir={direction}>
            <header className="topbar">
              <button className="brand-wordmark" onClick={resetShowroom} data-testid="button-brand-home" aria-label="Return to ALEMONA hero">
                <span>ALEMONA</span><small>Natural Hair &amp; Scalp Care</small>
              </button>
              <div className="top-actions">
                <nav className="language-nav" aria-label="Language selector">
                  {(['EN', 'TR', 'AR'] as Language[]).map((lang) => (
                    <button key={lang} className={language === lang ? 'active' : ''} onClick={() => selectLanguage(lang)} data-testid={`button-language-${lang.toLowerCase()}`}>{lang}</button>
                  ))}
                </nav>
                <button className="menu-button" onClick={() => setMobileMenu((open) => !open)} data-testid="button-open-menu" aria-label="Open navigation">
                  {mobileMenu ? <X size={16} /> : <Menu size={16} />}
                </button>
              </div>
            </header>

            {mobileMenu && (
              <nav className="mobile-menu" aria-label="Mobile navigation">
                <button onClick={() => goTo('collection')} data-testid="mobile-link-collection">{t.collection}</button>
                <button onClick={() => goTo('detail')} data-testid="mobile-link-formulas">{t.more}</button>
                <button onClick={() => goTo('philosophy')} data-testid="mobile-link-philosophy">{t.philosophy}</button>
                <button onClick={() => setDeskOpen(true)} data-testid="mobile-button-store">{t.find}</button>
              </nav>
            )}

            <section className="hero" id="hero">
              <img className="hero-image" src={assets.hero} alt="ALEMONA shampoo and conditioner in warm sunlight" data-testid="img-hero-still-life" />
              <div className="hero-content">
                <img className="hero-logo" src={assets.logo} alt="ALEMONA botanical logo" data-testid="img-brand-logo" />
                <div className="hero-kicker eyebrow">Natural Hair &amp; Scalp Care</div>
                <h1 data-testid="text-hero-alemona">ALEMONA</h1>
                <h2>Formulated with Botanical Oils &amp; Vitamin E</h2>
                <p className="hero-note">A quiet study of formulas, textures and the botanical details behind the ritual.</p>
                <div className="hero-actions">
                  <button className="primary-link" onClick={() => goTo('collection')} data-testid="button-explore-collection">{t.explore}<ArrowRight size={15} /></button>
                  <button className="quiet-link" onClick={() => goTo('detail')} data-testid="button-discover-formulas">{t.discover}</button>
                </div>
              </div>
              <div className="hero-scroll"><span>Enter the showroom</span><ArrowDown size={14} /></div>
            </section>

            <section className="section collection" id="collection">
              <div className="section-heading">
                <div><div className="eyebrow section-index">01 / ALEMONA</div><h2>{t.collection}</h2></div>
                <p>{t.collectionSub} Select a formula to move closer — into its texture, ingredients and use.</p>
              </div>
              <div className="collection-grid">
                <article className="product-card" onClick={() => openProduct('shampoo')} data-testid="card-product-shampoo" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && openProduct('shampoo')}>
                  <img className="product-card-image" src={assets.still} alt="ALEMONA Almond Tar Shampoo and Hair Conditioner" />
                  <div className="product-card-copy">
                    <div className="product-number">01 / Formula</div><h3>Almond Tar<br />Shampoo</h3>
                    <p>For softer and stronger hair. A botanical scalp-care formula with pure almond tar.</p>
                    <div className="card-meta"><span>350 ml</span><span className="card-arrow">{t.more}<ArrowUpRight size={15} /></span></div>
                  </div>
                </article>
                <article className="product-card" onClick={() => openProduct('conditioner')} data-testid="card-product-conditioner" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && openProduct('conditioner')}>
                  <img className="product-card-image" src={assets.hero} alt="ALEMONA Hair Conditioner in terracotta packaging" />
                  <div className="product-card-copy">
                    <div className="product-number">02 / Formula</div><h3>Hair<br />Conditioner</h3>
                    <p>With natural oils and Vitamin E. A restorative finish for smooth, tangle-free lengths.</p>
                    <div className="card-meta"><span>350 ml</span><span className="card-arrow">{t.more}<ArrowUpRight size={15} /></span></div>
                  </div>
                </article>
              </div>
            </section>

            <section className="section detail" id="detail" aria-label="Product detail">
              <div className="detail-shell">
                <div className="detail-media">
                  <div className="main-media">
                    <div className="media-marker eyebrow">Alemona / {selectedProduct ? `0${selectedProduct === 'shampoo' ? 1 : 2}` : '01'}<span>{selectedProduct ? product?.name : 'Choose a formula'}</span></div>
                    <img src={product ? gallery[galleryIndex] : assets.macro} alt={product ? `${product.name} detail` : 'Golden botanical formula macro'} key={`${selectedProduct}-${galleryIndex}`} data-testid="img-product-detail" />
                    {product && <button className="texture-open" onClick={() => setTextureOpen(true)} data-testid="button-view-texture"><Maximize2 size={13} /> View texture</button>}
                  </div>
                  {product && <div className="gallery-strip" aria-label="Product image gallery">
                    {gallery.map((image, index) => <button key={image} className={`thumb ${index === galleryIndex ? 'active' : ''}`} onClick={() => setGalleryIndex(index)} data-testid={`button-gallery-${index}`}><img src={image} alt={`${product.name} gallery view ${index + 1}`} /></button>)}
                  </div>}
                </div>
                <div className="detail-copy">
                  {product ? (
                    <>
                      <div className="eyebrow">{product.subtitle}</div>
                      <h2 data-testid="text-selected-product">{product.name}</h2>
                      <div className="detail-size">{product.size} · Natural Hair &amp; Scalp Care</div>
                      <p className="lead">{product.description}</p>
                      <div className="tabs" role="tablist">
                        {(['overview', 'texture', 'ingredients', 'use'] as TabKey[]).map((item) => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)} role="tab" aria-selected={tab === item} data-testid={`tab-product-${item}`}>{t[item]}</button>)}
                      </div>
                      <div className="tab-panel" key={tab}>
                        {tab === 'overview' && <><div className="eyebrow">A considered formula</div><p className="lead">{product.description}</p><div className="badge-list">{product.tags.map((tag) => <span className="badge" key={tag} data-testid={`badge-${tag.toLowerCase().replaceAll(' ', '-')}`}>{tag}</span>)}</div></>}
                        {tab === 'texture' && <><div className="eyebrow">Sensory profile</div><div className="stat-grid"><div className="stat"><small>Consistency</small><strong>{product.texture.consistency}</strong></div><div className="stat"><small>Scent profile</small><strong>{product.texture.scent}</strong></div><div className="stat"><small>{product.texture.feelLabel}</small><strong>{product.texture.feel}</strong></div></div><p className="lead" style={{ marginTop: '2rem' }}>{product.texture.copy}</p><button className="primary-link" style={{ marginTop: '1.5rem' }} onClick={() => setTextureOpen(true)} data-testid="button-open-texture-panel">View texture <Maximize2 size={14} /></button></>}
                        {tab === 'ingredients' && <><div className="eyebrow">Key ingredients</div><div className="accordion">{product.ingredients.map((ingredient, index) => <div className="accordion-item" key={ingredient.title}><button className={`accordion-trigger ${openIngredient === index ? 'open' : ''}`} onClick={() => setOpenIngredient(openIngredient === index ? -1 : index)} data-testid={`button-ingredient-${index}`}><span>{ingredient.title}</span>{openIngredient === index ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</button>{openIngredient === index && <div className="accordion-body">{ingredient.body}</div>}</div>)}</div></>}
                        {tab === 'use' && <><div className="eyebrow">How to use</div><div className="howto">{product.use.map((step, index) => <div className="step" key={step}><b>0{index + 1}</b><p>{step}</p></div>)}</div><div className="label-art"><img src={selectedProduct === 'shampoo' ? assets.shampooLabel : assets.conditionerLabel} alt={`${product.name} official packaging artwork and ingredients`} /><div className="label-caption">Official packaging artwork / ingredients &amp; usage panel</div></div><button className="inci-toggle" onClick={() => setInciOpen(!inciOpen)} data-testid="button-complete-ingredient-list">{inciOpen ? 'Hide complete ingredient list' : 'View complete ingredient list'}</button>{inciOpen && <div className="inci-copy" data-testid="text-complete-ingredients">{selectedProduct === 'shampoo' ? 'Aqua / Water, Sodium Laureth Sulfate, Glycerin, Cocamidopropyl Betaine, Juniperus Communis Needle Oil, Olea Europaea Fruit Oil, Cocos Nucifera Oil, Ricinus Communis Seed Oil, Sodium Chloride, Cocamide DEA, Almond Tar, Panthenol, Tocopherol, Parfum, Polyquaternium-10, Salicylic Acid.' : 'Aqua / Water, Cetearyl Alcohol, Glycerin, Cetrimonium Chloride, Butyrospermum Parkii Butter, Cocos Nucifera Oil, Prunus Amygdalus Dulcis Oil, Ricinus Communis Seed Oil, Nigella Sativa Seed Oil, Vitis Vinifera Seed Oil, Polyquaternium-7, Polyquaternium-10, Tocopherol, Parfum, Phenoxyethanol.'}<br /><br />Storage: Store between 20°C – 25°C.</div>}</>}
                      </div>
                    </>
                  ) : <><div className="eyebrow">02 / Formulas</div><h2>Come closer.</h2><p className="lead">Choose a bottle from the collection to explore its formula, sensory profile, ingredients and ritual.</p><div className="badge-list"><span className="badge">Botanical oils</span><span className="badge">Vitamin E</span><span className="badge">Natural care</span></div></>}
                </div>
              </div>
            </section>

            <section className="section philosophy" id="philosophy">
              <div className="philosophy-grid">
                <img className="philosophy-image" src={assets.logo} alt="ALEMONA botanical logo over leaves" data-testid="img-philosophy-logo" />
                <div className="philosophy-copy"><div className="eyebrow">03 / The point of view</div><h2>{t.philosophy}</h2><p>A premium botanical hair-care philosophy centered around carefully selected oils, thoughtful formulations, and a transparent approach to hair and scalp care.</p><p>Every detail is an invitation to look closer: the amber of the formula, the embossed label, the quiet rhythm of a considered ritual.</p></div>
              </div>
            </section>

            <section className="store-band" id="store">
              <div><div className="eyebrow">04 / Information desk</div><h3>{t.find}</h3></div>
              <div><p>For availability and local information, visit the ALEMONA information desk.</p><button className="store-button" onClick={() => setDeskOpen(true)} data-testid="button-find-store"><MapPin size={15} /> Visit information desk</button></div>
            </section>
            <footer className="footer"><strong>ALEMONA</strong><span>Natural Hair &amp; Scalp Care</span><span>Formulated with Botanical Oils &amp; Vitamin E</span></footer>
            <button className="kiosk-toggle" onClick={() => setKiosk((value) => !value)} data-testid="button-kiosk-mode">{kiosk ? 'Exit kiosk' : 'Kiosk mode'}</button>

            {textureOpen && product && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Texture viewer"><div className="texture-modal"><button className="close-modal" onClick={() => setTextureOpen(false)} data-testid="button-close-texture"><X size={18} /></button><img src={selectedProduct === 'shampoo' ? assets.pour : assets.macro} alt={`${product.name} texture detail`} /><div className="texture-modal-copy"><div className="eyebrow">Sensory study / {product.name}</div><h3>{product.texture.consistency}</h3><p>{product.texture.copy}</p><div className="stat"><small>{product.texture.feelLabel}</small><strong>{product.texture.feel}</strong></div></div></div></div>}
            {deskOpen && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Information desk"><div className="texture-modal" style={{ gridTemplateColumns: '1fr' }}><button className="close-modal" onClick={() => setDeskOpen(false)} data-testid="button-close-desk"><X size={18} /></button><div className="texture-modal-copy"><div className="eyebrow">ALEMONA / Information desk</div><h3>Find your way in.</h3><p>Store and stand information will be shared here as locations become available. This showroom is dedicated to exploring the formulas.</p><button className="primary-link" onClick={() => setDeskOpen(false)} data-testid="button-close-desk-copy">Return to the collection <ArrowLeft size={14} /></button></div></div></div>}
          </main>
        </ErrorBoundary>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;