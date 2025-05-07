(function(){
    const container = document.getElementById('cards-container');

    const getTime = d => d ? parseESTLocal(d).getTime() : Number.POSITIVE_INFINITY;
    
    const fmtDate = d => {
      return new Date(d).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/New_York' // <- Force EST/EDT
      });
    };

    const dateRange = (s,e) => {
      const sd=parseESTLocal(s), ed=parseESTLocal(e);
      return sd.getTime()===ed.getTime()
        ? fmtDate(sd)
        : fmtDate(sd) + ' - ' + fmtDate(ed);
    };

    const formatAge = str => {
      const match = str.match(/^P(\d{2})Y(\d{2})M$/);
      if (!match) return str;
      const [ , years ] = match.map(Number);
      return years;
    };

    const formatAgeRange = (min, max) => {
      const minFormatted = formatAge(min);
      const maxFormatted = formatAge(max);
      if (!maxFormatted || isNaN(maxFormatted) || maxFormatted >= 99) return `${minFormatted} & Up`;
      return `${minFormatted} - ${maxFormatted}`;
    };

    const formatTime = str => {
      const [hour, minute] = str.split(':').map(Number);
      const suffix = hour >= 12 ? 'pm' : 'am';
      const hour12 = ((hour + 11) % 12) + 1;
      return `${hour12}:${String(minute).padStart(2, '0')}${suffix}`;
    };

    const cfg = JSON.parse(
      document.getElementById('config').textContent
    );
    
    const categoryNameMap  = cfg.categoryNameMap;
    const hiddenCategories = cfg.hiddenCategories;
    const displayToggles   = cfg.displayToggles;

    // ============== CHANGE ONLY ABOVE =========================

    const filters = {
      category: null,
      season: null,
      inputAge: null,
      startAfter: new Date(),
      endBefore: null,
      startTimeAfter: null,
      endTimeBefore: null,
      titleSearch: '',
      hasOpenings: true
    };

    // ============== Lite-Markdown → HTML =========================
    function mdLite(text) {
      if (!text) return '';

      // 1. Handle forced line breaks first
      const paraLines = text.split('||');

      // 2. Convert each line
      const htmlLines = paraLines.map(line => {
        // bullet?
        if (/^\s*\*\s+/.test(line)) {
          const item = line.replace(/^\s*\*\s+/, '');
          return `<li>${item}</li>`;
        }
        return line;
      });

      // 3. Wrap contiguous <li> blocks in <ul>
      let html = htmlLines.join('\n');
      html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
                .replace(/<\/ul>\s*<ul>/g, '');           // merge adjacent lists

      // 4. Inline links  [text](url)
      html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
                          '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

      return html;
    }

    function parseESTLocal(dateStr) {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(y, m - 1, d);   // midnight in local (EST/EDT)
    }


    let all = [];

    function init(){
      fetch('https://jackrabbit-proxy.trush081.workers.dev/')
        .then(r=>r.json())
        .then(({rows=[]})=>{
          all = rows
            .filter(r=>r.openings.calculated_openings>0)
            .map(r=>({
              id:        r.id || '',
              title:     r.name || 'Untitled Class',
              desc:      (r.description || '').replace(/\r?\n/g, '||'),
              days:      r.meeting_days
                          ? Object.entries(r.meeting_days)
                              .filter(([, v]) => v)
                              .map(([d]) => d[0].toUpperCase() + d.slice(1))
                              .join(', ')
                          : 'N/A',
              start_time: r.start_time ? formatTime(r.start_time) : '—',
              end_time:   r.end_time ? formatTime(r.end_time) : '—',
              age_range:  formatAgeRange(r.min_age || 'P03Y00M', r.max_age || 'P99Y00M'),
              openings:   r.openings?.calculated_openings ?? '—',
              date_range: r.start_date && r.end_date
                            ? dateRange(r.start_date, r.end_date)
                            : 'TBD',
              start_date: r.start_date || '',
              end_date:   r.end_date || '',
              tuition:    r.tuition?.fee != null ? `$${r.tuition.fee.toFixed(2)}` : 'N/A',
              reg_link:   r.online_reg_link && r.online_reg_link !== '#' ? r.online_reg_link : null,
              category1:  r.category1 || '',
              category2:  r.category2 || '',
              category3:  r.category3 || '',
              session:    r.session || '',
            }));

            all.sort((a, b) => getTime(a.start_date) - getTime(b.start_date));
          
            const categorySet = new Set();
            all.forEach(item => {
              [item.category1, item.category2, item.category3].forEach(cat => {
                if (cat) categorySet.add(cat);
              });
            });

            // Sort and add to dropdown Categories
            const categorySelect = document.getElementById('filter-category');
            Array.from(categorySet)
              .sort()
              .forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                categorySelect.appendChild(opt);
              });
              
              // Sort and add to dropdown Seasons
              const seasonSet = new Set();
              all.forEach(item => {
                const season = item.session?.split(' ')[1];
                if (season) seasonSet.add(season);
              });

              const seasonSelect = document.getElementById('filter-season');
              Array.from(seasonSet)
                .sort()
                .forEach(season => {
                  const opt = document.createElement('option');
                  opt.value = season;
                  opt.textContent = season;
                  seasonSelect.appendChild(opt);
                });

          render();

          // build "YYYY‑MM‑DD" in local (EST/EDT) zone
          const now   = new Date();
          const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

          document.getElementById('filter-start-date').value = today;

          filters.startAfter = parseESTLocal(today)
        });
    }

    function render(){
      const filtered = all.filter(c => {
        if (filters.category && ![c.category1, c.category2, c.category3].includes(filters.category)) return false;
        if (filters.season && c.session?.split(' ')[1] !== filters.season) return false;
        
        if (filters.inputAge !== null) {
          const ageParts = c.age_range.split(' ');
          const ageMin = parseInt(ageParts[0]);
          const ageMax = parseInt(ageParts[2]); // if format is "5 - 8"

          const isAndUp = c.age_range.includes('& Up');

          if (isNaN(ageMin)) return false;

          if (isAndUp) {
            if (filters.inputAge < ageMin) return false;
          } else if (!isNaN(ageMax)) {
            if (filters.inputAge < ageMin || filters.inputAge > ageMax) return false;
          } else {
            return false; // unrecognized format
          }
        }

        // Start Date Filter
        if (filters.startAfter && c.start_date) {
          const classStart = parseESTLocal(c.start_date);
          if (classStart < filters.startAfter) return false;
        }

        // End Date Filter
        if (filters.endBefore && c.end_date) {
          const classEnd = parseESTLocal(c.end_date);
          if (classEnd > filters.endBefore) return false;
        }

        // START TIME AFTER
        if (filters.startTimeAfter && c.start_time) {
          const [h, m, p] = c.start_time.match(/(\d+):(\d+)(am|pm)/i)?.slice(1) || [];
          if (h && m && p) {
            let hour24 = parseInt(h) % 12 + (p.toLowerCase() === 'pm' ? 12 : 0);
            const classMinutes = hour24 * 60 + parseInt(m);

            const [ha, ma] = filters.startTimeAfter.split(':').map(Number);
            const afterMinutes = ha * 60 + ma;

            if (classMinutes < afterMinutes) return false;
          }
        }

        // END TIME BEFORE
        if (filters.endTimeBefore && c.end_time) {
          const [h, m, p] = c.end_time.match(/(\d+):(\d+)(am|pm)/i)?.slice(1) || [];
          if (h && m && p) {
            let hour24 = parseInt(h) % 12 + (p.toLowerCase() === 'pm' ? 12 : 0);
            const classMinutes = hour24 * 60 + parseInt(m);

            const [hb, mb] = filters.endTimeBefore.split(':').map(Number);
            const beforeMinutes = hb * 60 + mb;

            if (classMinutes > beforeMinutes) return false;
          }
        }

        if (filters.hasOpenings && (!c.openings || c.openings <= 0)) return false;
        if (filters.titleSearch && !c.title.toLowerCase().includes(filters.titleSearch)) return false;

        return true;
      });

      let html = '';
      const grouped = {};
      filtered.forEach(item => {
        const cats = [item.category1, item.category2, item.category3].filter(Boolean);
        cats.forEach(cat => {
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(item);
        });
      });

      const uncategorized = [];
      hiddenCategories.forEach(cat => {
        if (grouped[cat]) {
          uncategorized.push(...grouped[cat]);
          delete grouped[cat];             // remove so they don’t render twice
        }
      });

      Object.keys(grouped)
        .sort((a, b) => {
          const A = (categoryNameMap[a] || a).toLowerCase();
          const B = (categoryNameMap[b] || b).toLowerCase();
          return A.localeCompare(B);
        })
        .forEach(category => {
          const items = grouped[category];
          const isHidden = hiddenCategories.includes(category);

          if (!isHidden) {                        // header only if not hidden
            const display = categoryNameMap[category] || category;
            html += `<h2 class="category-header">${display}</h2>`;
          }

          html += `<div class="cards-grid">`;     // cards always render
          html += items.map(c => `
            <div class="card">
              <div class="card-header">
                <div class="card-header-top">
                  ${c.session && displayToggles.showSeason ? `<span class="session-label ${c.session.split(' ')[1].toLowerCase()}">${c.session.split(' ')[1]}</span>` : ''}
                  ${c.openings && displayToggles.showOpenings ? `<span class="openings-label">${c.openings} spots left</span>` : ''}
                </div>
                <h3>${c.title}</h3>
              </div>
              <div class="description">
                <span class="short-desc">${c.desc.split('||').slice(0,3).join(' ') + (c.desc.length > 140 ? '...' : '')}</span>
                <span class="full-desc">${mdLite(c.desc)}</span>
                <span class="read-more-toggle">Read more</span>
              </div>
              ${c.age_range && displayToggles.showAges ? `<p><strong>Ages:</strong> ${c.age_range}</p>` : ''}
              ${c.days && displayToggles.showDays ? `<p><strong>Day(s):</strong> ${c.days}</p>` : ''}
              ${c.date_range && displayToggles.showDates ? `<p><strong>Date(s):</strong> ${c.date_range}</p>` : ''}
              ${c.start_time && c.end_time && displayToggles.showTime ? `<p><strong>Time:</strong> ${c.start_time} - ${c.end_time}</p>` : ''}
              ${c.tuition && displayToggles.showTuition ? `<p class="tuition"><strong>Tuition:</strong> ${c.tuition}</p>` : ''}
              ${c.reg_link ? `<a class="register-button" href="${c.reg_link}" target="_blank">Register</a>` : ''}
            </div>
          `).join('');
          html += `</div>`;
        });

        if (uncategorized.length) {
          html += `<h2 class="category-header">Other</h2>`;
          html += `<div class="cards-grid">`;
          html += uncategorized.map(c => `
            <div class="card">
              <div class="card-header">
                <div class="card-header-top">
                  ${c.session && displayToggles.showSeason ? `<span class="session-label ${c.session.split(' ')[1].toLowerCase()}">${c.session.split(' ')[1]}</span>` : ''}
                  ${c.openings && displayToggles.showOpenings ? `<span class="openings-label">${c.openings} spots left</span>` : ''}
                </div>
                <h3>${c.title}</h3>
              </div>
              <div class="description">
                <span class="short-desc">${c.desc.split('||').slice(0,3).join(' ') + (c.desc.length > 140 ? '...' : '')}</span>
                <span class="full-desc">${mdLite(c.desc)}</span>
                <span class="read-more-toggle">Read more</span>
              </div>
              ${c.age_range && displayToggles.showAges ? `<p><strong>Ages:</strong> ${c.age_range}</p>` : ''}
              ${c.days && displayToggles.showDays ? `<p><strong>Day(s):</strong> ${c.days}</p>` : ''}
              ${c.date_range && displayToggles.showDates ? `<p><strong>Date(s):</strong> ${c.date_range}</p>` : ''}
              ${c.start_time && c.end_time && displayToggles.showTime ? `<p><strong>Time:</strong> ${c.start_time} - ${c.end_time}</p>` : ''}
              ${c.tuition && displayToggles.showTuition ? `<p class="tuition"><strong>Tuition:</strong> ${c.tuition}</p>` : ''}
              ${c.reg_link ? `<a class="register-button" href="${c.reg_link}" target="_blank">Register</a>` : ''}
            </div>
          `).join('');
          html += `</div>`;
        }

      container.innerHTML = html || '<p>No classes available.</p>';

      document.querySelectorAll('.read-more-toggle').forEach(btn => {
        btn.onclick = () => {
          const card = btn.closest('.card'); // get the parent card
          const isExpanded = card.classList.toggle('expanded'); // toggle class

          btn.textContent = isExpanded ? 'Show less' : 'Read more'; // update text
        };
      });
    }

    init();

    // Filter event listeners (AFTER init)
    document.getElementById('filter-category').addEventListener('change', (e) => {
      filters.category = e.target.value || null;
    });

    document.getElementById('filter-season').addEventListener('change', (e) => {
      filters.season = e.target.value || null;
    });

    document.getElementById('filter-exact-age').addEventListener('input', (e) => {
      const value = e.target.value;
      filters.inputAge = value ? parseInt(value) : null;
    });

    document.getElementById('filter-start-date').addEventListener('change', (e) => {
      filters.startAfter = e.target.value ? parseESTLocal(e.target.value) : null;
    });

    document.getElementById('filter-end-date').addEventListener('change', (e) => {
      filters.endBefore = e.target.value ? parseESTLocal(e.target.value) : null;
    });

    document.getElementById('filter-time-start').addEventListener('change', (e) => {
      filters.startTimeAfter = e.target.value || null; // e.g. "10:00"
    });

    document.getElementById('filter-end-time').addEventListener('change', (e) => {
      filters.endTimeBefore = e.target.value || null; // e.g. "15:00"
    });

    // APPLY = run render() with current selections
    document.getElementById('apply-filters').addEventListener('click', () => {
      render();
    });

    // CLEAR = reset UI + filters, then render()
    document.getElementById('clear-filters').addEventListener('click', () => {
      // reset form controls
      document.querySelectorAll('#filters-panel input').forEach(i => i.value = '');
      document.getElementById('filter-category').value = '';
      document.getElementById('filter-season').value = '';

      // reset filters object
      Object.assign(filters, {
        category: null,
        season: null,
        inputAge: null,
        startAfter: null,
        endBefore: null,
        startTimeAfter: null,
        endTimeBefore: null,
      });

      render();
    });

    document.getElementById('filter-has-openings').addEventListener('change', (e) => {
      filters.hasOpenings = e.target.checked;
      render();
    });

    document.getElementById('filter-title-search').addEventListener('input', (e) => {
      filters.titleSearch = e.target.value.toLowerCase();
      render();
    });

    document.getElementById('toggle-filters').addEventListener('click', () => {
      const panel = document.getElementById('filters-panel');
      const btn = document.getElementById('toggle-filters');

      const isOpen = panel.classList.toggle('active');
      btn.textContent = isOpen ? 'Hide Filters' : 'Show Filters';
    });

  })();