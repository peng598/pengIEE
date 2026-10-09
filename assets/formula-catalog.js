(() => {
  const search = document.querySelector('#formula-library-search');
  const domainSelect = document.querySelector('#formula-library-domain');
  const count = document.querySelector('#formula-library-count');
  const empty = document.querySelector('#formula-library-empty');
  const groups = [...document.querySelectorAll('.formula-domain')];
  if (!search || !domainSelect || !count || !empty || !groups.length) return;

  const filter = () => {
    const query = search.value.trim().toLocaleLowerCase();
    const selectedDomain = domainSelect.value;
    let visible = 0;

    groups.forEach((group) => {
      const domainMatches = selectedDomain === '全部' || group.dataset.domain === selectedDomain;
      let groupVisible = 0;
      group.querySelectorAll('.formula-entry').forEach((entry) => {
        const matches = domainMatches && (!query || `${entry.dataset.search} ${entry.textContent}`.toLocaleLowerCase().includes(query));
        entry.hidden = !matches;
        if (matches) {
          groupVisible += 1;
          visible += 1;
        }
      });
      group.hidden = groupVisible === 0;
      if (query) group.open = groupVisible > 0;
      else if (selectedDomain !== '全部') group.open = group.dataset.domain === selectedDomain;
      else group.open = false;
    });

    count.textContent = `${visible} 组公式`;
    empty.hidden = visible > 0;
  };

  search.addEventListener('input', filter);
  domainSelect.addEventListener('change', filter);
  filter();
})();
