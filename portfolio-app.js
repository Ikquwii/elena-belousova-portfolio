(() => {
  const data = window.PORTFOLIO_DATA;
  const root = document.querySelector('#portfolio-root');
  const concept = document.body.dataset.concept;

  if (!data || !root || !concept) throw new Error('Portfolio data, root, or concept identifier is missing.');

  const concepts = [
    ['maison', 'Maison', 'concept-1-aperture.html'],
    ['monograph', 'Monograph', 'concept-2-index.html'],
    ['ledger', 'Runway Ledger', 'concept-3-chapters.html'],
    ['salon', 'Salon', 'concept-4-contact-sheet.html'],
    ['folio', 'Folio', 'concept-5-afterimage.html'],
    ['sequence', 'Sequence', 'concept-6-sequence.html'],
    ['cabinet', 'Cabinet', 'concept-7-cabinet.html'],
    ['editions', 'Editions', 'concept-8-editions.html'],
    ['rooms', 'Four Rooms', 'concept-9-four-rooms.html'],
    ['notes', 'Field Notes', 'concept-10-field-notes.html'],
  ];

  const allImages = data.sections.flatMap((section) => section.images.map((image) => ({ ...image, section: section.title })));
  document.body.dataset.imageCount = String(allImages.length);

  const escape = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character]);

  const imageTag = (image, { thumb = false, eager = false, className = '' } = {}) => `
    <img class="${className}" src="${escape(thumb ? image.thumb : image.src)}" alt="${escape(image.alt)}"
      loading="${eager ? 'eager' : 'lazy'}" decoding="async" data-media-id="${escape(image.id)}">`;

  const plate = (image, index, className = '', caption = true) => `
    <figure class="photo-plate ${className}">
      <button class="photo-button" type="button" data-lightbox="${escape(image.id)}" aria-label="Open ${escape(image.alt)}">
        ${imageTag(image, { thumb: true, eager: index < 2 })}
      </button>
      ${caption ? `<figcaption><span>${String(index + 1).padStart(3, '0')}</span><span>${escape(image.section || '')}</span></figcaption>` : ''}
    </figure>`;

  const sectionLinks = (className = 'section-links') => `
    <nav class="${className}" aria-label="Portfolio sections">
      ${data.sections.map((section) => `<a href="#${section.slug}">${escape(section.title)}</a>`).join('')}
    </nav>`;

  const header = (variant = '') => `
    <header class="site-head ${variant}">
      <a class="site-brand" href="#main">Elena Belousova</a>
      ${sectionLinks()}
      <a class="site-contact" href="mailto:hello@example.com">Enquire ↗</a>
    </header>`;

  const footer = () => `
    <footer class="site-footer">
      <p>European fashion photographer</p>
      <a href="mailto:hello@example.com">Available for commissions ↗</a>
      <p>Barcelona · Paris · Milan · © 2026</p>
    </footer>`;

  const heroCopy = {
    maison: ['A quiet house for images.', 'Four rooms, one photographic point of view.'],
    monograph: ['Every story deserves its own pace.', 'A portfolio read as a collected monograph.'],
    ledger: ['The complete visual record.', 'A precise index built for fast professional review.'],
    salon: ['Photography, hung with space around it.', 'A digital salon where the frame stays complete.'],
    folio: ['Open the work. Stay with the image.', 'A tactile folio for deliberate viewing.'],
    sequence: ['One frame leads into the next.', 'A cinematic sequence with visible chapter boundaries.'],
    cabinet: ['A private viewing room.', 'Darkness recedes; the photograph holds the light.'],
    editions: ['Four bodies of work, bound together.', 'A portfolio organised as a set of considered editions.'],
    rooms: ['Enter through four distinct rooms.', 'Each practice keeps its own rhythm and atmosphere.'],
    notes: ['Selected with a photographer’s eye.', 'A working notebook refined into a public archive.'],
  };

  const renderMaison = () => `
    ${header('head-minimal')}
    <main id="main" class="maison-layout">
      <aside class="maison-intro">
        <p class="maison-mark">EB</p>
        <div><h1>${heroCopy.maison[0]}</h1><p>${heroCopy.maison[1]}</p></div>
        <div class="maison-tally"><span>${data.totalImages} photographs</span><span>4 rooms</span></div>
        ${sectionLinks('maison-menu')}
      </aside>
      <div class="maison-rooms">
        ${data.sections.map((section, sectionIndex) => `
          <section id="${section.slug}" class="maison-room">
            <header><h2>${escape(section.title)}</h2><p>${escape(section.note)} · ${section.images.length}</p></header>
            <div class="maison-wall">
              ${section.images.map((image, index) => plate({ ...image, section: section.title }, index, `wall-${(index + sectionIndex) % 5}`, false)).join('')}
            </div>
          </section>`).join('')}
      </div>
    </main>${footer()}`;

  const renderMonograph = () => `
    ${header('head-overlay')}
    <main id="main">
      <section class="monograph-cover">
        <div class="monograph-cover__image">${imageTag(allImages[7], { eager: true })}</div>
        <div class="monograph-cover__copy"><p>Collected work · 2026</p><h1>${heroCopy.monograph[0]}</h1><span>${heroCopy.monograph[1]}</span></div>
      </section>
      ${data.sections.map((section, sectionIndex) => `
        <section id="${section.slug}" class="monograph-chapter">
          <header class="chapter-leaf"><span>Chapter ${sectionIndex + 1}</span><h2>${escape(section.title)}</h2><p>${escape(section.note)}</p></header>
          <div class="monograph-stream">
            ${section.images.map((image, index) => plate({ ...image, section: section.title }, index, `measure-${index % 4}`)).join('')}
          </div>
        </section>`).join('')}
    </main>${footer()}`;

  const renderLedger = () => `
    ${header('head-ledger')}
    <main id="main" class="ledger-shell">
      <aside class="ledger-index">
        <p>Portfolio register</p><h1>${heroCopy.ledger[0]}</h1><p>${heroCopy.ledger[1]}</p>
        ${sectionLinks('ledger-menu')}
        <div class="ledger-total"><strong>${data.totalImages}</strong><span>Wix archive / current</span></div>
      </aside>
      <div class="ledger-archive">
        ${data.sections.map((section) => `
          <section id="${section.slug}" class="ledger-section">
            <header><h2>${escape(section.title)}</h2><span>${section.images.length} frames</span></header>
            <div class="ledger-grid">
              ${section.images.map((image, index) => plate({ ...image, section: section.title }, index, index % 11 === 0 ? 'ledger-wide' : '')).join('')}
            </div>
          </section>`).join('')}
      </div>
    </main>${footer()}`;

  const renderSalon = () => `
    ${header('head-salon')}
    <main id="main">
      <section class="salon-foyer"><div><p>Elena Belousova</p><h1>${heroCopy.salon[0]}</h1></div><p>${heroCopy.salon[1]}</p></section>
      ${data.sections.map((section, sectionIndex) => `
        <section id="${section.slug}" class="salon-room room-tone-${sectionIndex}">
          <header><span>${escape(section.note)}</span><h2>${escape(section.title)}</h2><span>${section.images.length} works</span></header>
          <div class="salon-wall">
            ${section.images.map((image, index) => plate({ ...image, section: section.title }, index, `hang-${index % 7}`, false)).join('')}
          </div>
        </section>`).join('')}
    </main>${footer()}`;

  const renderFolio = () => `
    ${header('head-folio')}
    <main id="main">
      <section class="folio-opening"><div class="folio-opening__photo">${imageTag(allImages[2], { eager: true })}</div><div><p>Portfolio / 2026</p><h1>${heroCopy.folio[0]}</h1><span>${heroCopy.folio[1]}</span></div></section>
      ${data.sections.map((section, sectionIndex) => {
        const lead = section.images[0];
        return `<section id="${section.slug}" class="folio-section" data-folio-section>
          <header><div><span>Volume ${sectionIndex + 1}</span><h2>${escape(section.title)}</h2></div><p>${escape(section.note)} · ${section.images.length}</p></header>
          <div class="folio-stage"><button type="button" data-lightbox="${escape(lead.id)}" aria-label="Open lead photograph">${imageTag(lead)}</button><span>${escape(section.title)}</span></div>
          <div class="folio-strip" aria-label="${escape(section.title)} thumbnails">
            ${section.images.map((image, index) => `<button type="button" class="folio-thumb${index === 0 ? ' active' : ''}" data-folio-image="${escape(image.id)}" aria-label="Show ${escape(image.alt)}">${imageTag(image, { thumb: true })}<span>${String(index + 1).padStart(2, '0')}</span></button>`).join('')}
          </div>
        </section>`;
      }).join('')}
    </main>${footer()}`;

  const renderSequence = () => `
    ${header('head-sequence')}
    <main id="main">
      <section class="sequence-title"><div><h1>${heroCopy.sequence[0]}</h1><p>${heroCopy.sequence[1]}</p></div><span>Scroll each sequence →</span></section>
      ${data.sections.map((section, sectionIndex) => `
        <section id="${section.slug}" class="sequence-section">
          <header><h2>${escape(section.title)}</h2><p>${escape(section.note)} · ${section.images.length}</p></header>
          <div class="sequence-track" tabindex="0" aria-label="Horizontal sequence: ${escape(section.title)}">
            ${section.images.map((image, index) => plate({ ...image, section: section.title }, index, `sequence-${(index + sectionIndex) % 4}`, false)).join('')}
          </div>
        </section>`).join('')}
    </main>${footer()}`;

  const renderCabinet = () => `
    ${header('head-cabinet')}
    <main id="main">
      <section class="cabinet-opening"><div class="cabinet-opening__image">${imageTag(allImages[5], { eager: true })}</div><div><h1>${heroCopy.cabinet[0]}</h1><p>${heroCopy.cabinet[1]}</p>${sectionLinks('cabinet-menu')}</div></section>
      ${data.sections.map((section) => {
        const lead = section.images[0];
        return `<section id="${section.slug}" class="cabinet-section" data-cabinet-section>
          <header><h2>${escape(section.title)}</h2><span>${escape(section.note)}</span></header>
          <div class="cabinet-display"><button type="button" data-lightbox="${escape(lead.id)}" aria-label="Open selected plate">${imageTag(lead)}</button><p>Selected plate / ${String(1).padStart(3, '0')}</p></div>
          <div class="cabinet-drawer">
            ${section.images.map((image, index) => `<button type="button" class="cabinet-thumb${index === 0 ? ' active' : ''}" data-cabinet-image="${escape(image.id)}" aria-label="Select ${escape(image.alt)}">${imageTag(image, { thumb: true })}<span>${String(index + 1).padStart(3, '0')}</span></button>`).join('')}
          </div>
        </section>`;
      }).join('')}
    </main>${footer()}`;

  const renderEditions = () => `
    ${header('head-editions')}
    <main id="main">
      <section class="editions-cover"><p>Elena Belousova</p><h1>${heroCopy.editions[0]}</h1><span>${heroCopy.editions[1]}</span><div>${data.sections.map((section, index) => `<a href="#${section.slug}"><b>${index + 1}</b>${escape(section.title)}</a>`).join('')}</div></section>
      ${data.sections.map((section, sectionIndex) => `
        <article id="${section.slug}" class="edition">
          <header><p>Edition ${String(sectionIndex + 1).padStart(2, '0')}</p><h2>${escape(section.title)}</h2><span>${escape(section.note)}</span></header>
          <div class="edition-pages">
            ${section.images.map((image, index) => plate({ ...image, section: section.title }, index, index % 6 === 0 ? 'edition-plate' : '', false)).join('')}
          </div>
        </article>`).join('')}
    </main>${footer()}`;

  const renderRooms = () => `
    ${header('head-rooms')}
    <main id="main">
      <section class="rooms-threshold"><div><h1>${heroCopy.rooms[0]}</h1><p>${heroCopy.rooms[1]}</p></div>${sectionLinks('rooms-menu')}</section>
      ${data.sections.map((section, sectionIndex) => `
        <section id="${section.slug}" class="four-room four-room-${sectionIndex}">
          <div class="four-room__lead"><div class="four-room__image">${imageTag(section.images[0], { eager: sectionIndex === 0 })}</div><header><span>Room ${sectionIndex + 1}</span><h2>${escape(section.title)}</h2><p>${escape(section.note)}</p></header></div>
          <div class="four-room__collection">
            ${section.images.map((image, index) => plate({ ...image, section: section.title }, index, `room-frame-${index % 5}`, false)).join('')}
          </div>
        </section>`).join('')}
    </main>${footer()}`;

  const renderNotes = () => `
    ${header('head-notes')}
    <main id="main" class="notes-shell">
      <aside class="notes-margin"><p>Elena Belousova<br>Working archive</p><h1>${heroCopy.notes[0]}</h1><p>${heroCopy.notes[1]}</p>${sectionLinks('notes-menu')}<span>${data.totalImages} entries / current edit</span></aside>
      <div class="notes-content">
        ${data.sections.map((section, sectionIndex) => `
          <section id="${section.slug}" class="notes-section">
            <header><span>${String(sectionIndex + 1).padStart(2, '0')}</span><h2>${escape(section.title)}</h2><p>${escape(section.note)}</p></header>
            <div class="notes-grid">
              ${section.images.map((image, index) => `<div class="note-entry note-${index % 6}">${plate({ ...image, section: section.title }, index, '', false)}<p>${String(index + 1).padStart(3, '0')} / ${escape(section.note)}</p></div>`).join('')}
            </div>
          </section>`).join('')}
      </div>
    </main>${footer()}`;

  const renderers = { maison: renderMaison, monograph: renderMonograph, ledger: renderLedger, salon: renderSalon, folio: renderFolio, sequence: renderSequence, cabinet: renderCabinet, editions: renderEditions, rooms: renderRooms, notes: renderNotes };
  if (!renderers[concept]) throw new Error(`Unknown concept: ${concept}`);

  root.innerHTML = renderers[concept]();

  document.body.insertAdjacentHTML('beforeend', `
    <dialog class="image-dialog" aria-label="Photograph viewer">
      <div class="image-dialog__bar"><span>Elena Belousova</span><span data-dialog-caption></span><button type="button" aria-label="Close viewer">×</button></div>
      <figure><img src="${escape(allImages[0].thumb)}" alt="${escape(allImages[0].alt)}"></figure>
    </dialog>
    <nav class="concept-dock" aria-label="Concept switcher">
      <a class="dock-home" href="index.html">All concepts</a>
      ${concepts.map(([slug, , file], index) => `<a href="${file}"${slug === concept ? ' aria-current="page"' : ''} aria-label="Concept ${index + 1}">${index + 1}</a>`).join('')}
    </nav>`);

  const byId = new Map(allImages.map((image) => [image.id, image]));
  const dialog = document.querySelector('.image-dialog');
  const dialogImage = dialog.querySelector('img');
  const dialogCaption = dialog.querySelector('[data-dialog-caption]');
  const openDialog = (id) => {
    const image = byId.get(id);
    if (!image) return;
    dialogImage.src = image.src;
    dialogImage.alt = image.alt;
    dialogCaption.textContent = image.section;
    dialog.showModal();
  };
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-lightbox]');
    if (trigger) openDialog(trigger.dataset.lightbox);
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

  document.querySelectorAll('[data-folio-section]').forEach((section) => {
    const stage = section.querySelector('.folio-stage');
    section.querySelectorAll('[data-folio-image]').forEach((button) => button.addEventListener('click', () => {
      const image = byId.get(button.dataset.folioImage);
      if (!image) return;
      section.querySelectorAll('.folio-thumb').forEach((item) => item.classList.toggle('active', item === button));
      const stageImage = stage.querySelector('img');
      stageImage.classList.add('is-changing');
      window.setTimeout(() => {
        stageImage.src = image.src;
        stageImage.alt = image.alt;
        stage.querySelector('button').dataset.lightbox = image.id;
        stage.querySelector('span').textContent = image.section;
        stageImage.onload = () => stageImage.classList.remove('is-changing');
      }, 160);
    }));
  });

  document.querySelectorAll('[data-cabinet-section]').forEach((section) => {
    const display = section.querySelector('.cabinet-display');
    section.querySelectorAll('[data-cabinet-image]').forEach((button, index) => button.addEventListener('click', () => {
      const image = byId.get(button.dataset.cabinetImage);
      if (!image) return;
      section.querySelectorAll('.cabinet-thumb').forEach((item) => item.classList.toggle('active', item === button));
      const displayImage = display.querySelector('img');
      displayImage.src = image.src;
      displayImage.alt = image.alt;
      display.querySelector('button').dataset.lightbox = image.id;
      display.querySelector('p').textContent = `Selected plate / ${String(index + 1).padStart(3, '0')}`;
    }));
  });

  document.querySelectorAll('.sequence-track').forEach((track) => {
    track.addEventListener('wheel', (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX) || window.innerWidth < 800) return;
      event.preventDefault();
      track.scrollBy({ left: event.deltaY * 1.1, behavior: 'auto' });
    }, { passive: false });
  });
})();
