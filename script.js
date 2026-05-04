let rawData = [];
let chart;
const fmt = new Intl.NumberFormat('ru-RU');

const $ = (id) => document.getElementById(id);
const yearOf = (d) => String(new Date(d).getFullYear());

async function loadData(){
  const res = await fetch('data.json?cache=' + Date.now());
  rawData = await res.json();
  rawData.sort((a,b)=> a.date.localeCompare(b.date));
  initTabs(); initFilters(); renderAll();
}

function initTabs(){
  document.querySelectorAll('.tab').forEach(btn=>{
    btn.onclick = () => {
      document.querySelectorAll('.tab,.panel').forEach(el=>el.classList.remove('active'));
      btn.classList.add('active'); $(btn.dataset.tab).classList.add('active');
      if(chart) chart.resize();
    };
  });
}

function initFilters(){
  const channels = [...new Set(rawData.map(x=>x.channel))];
  const years = [...new Set(rawData.map(x=>yearOf(x.date)))].sort();
  $('channelSelect').innerHTML = channels.map(c=>`<option>${c}</option>`).join('');
  $('yearSelect').innerHTML = '<option value="all">Все годы</option>' + years.map(y=>`<option>${y}</option>`).join('');
  $('topYearSelect').innerHTML = years.map(y=>`<option>${y}</option>`).join('');
  $('topYearSelect').value = years[years.length-1] || '';
  ['channelSelect','yearSelect','topYearSelect','topSortSelect'].forEach(id => $(id).onchange = renderAll);
  $('resetZoom').onclick = () => chart && chart.resetZoom();
}

function getFiltered(){
  const channel = $('channelSelect').value;
  const year = $('yearSelect').value;
  return rawData.filter(x => x.channel === channel && (year === 'all' || yearOf(x.date) === year));
}

function renderCards(data){
  const last = data[data.length-1];
  if(!last) return;
  $('subsNow').textContent = fmt.format(last.subscribers);
  $('viewsNow').textContent = fmt.format(last.views);
  $('videosNow').textContent = fmt.format(last.videos);
  const first = data[0];
  $('yearGrowth').textContent = '+' + fmt.format(last.subscribers - first.subscribers);
}

function renderChart(data){
  const ctx = $('statsChart');
  if(chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: { labels: data.map(x=>x.date), datasets: [
      { label:'Подписчики', data:data.map(x=>x.subscribers), tension:.25 },
      { label:'Просмотры', data:data.map(x=>x.views), tension:.25 },
      { label:'Видео', data:data.map(x=>x.videos), tension:.25 }
    ]},
    options: {
      responsive:true, maintainAspectRatio:false,
      interaction:{mode:'index',intersect:false},
      plugins:{ legend:{labels:{color:'#e5e7eb'}}, zoom:{ pan:{enabled:true,mode:'x'}, zoom:{wheel:{enabled:true},pinch:{enabled:true},mode:'x'} } },
      scales:{ x:{ticks:{color:'#cbd5e1'},grid:{color:'#334155'}}, y:{ticks:{color:'#cbd5e1'},grid:{color:'#334155'}} }
    }
  });
}

function yearlyTop(year, sortKey){
  const channels = [...new Set(rawData.map(x=>x.channel))];
  return channels.map(channel=>{
    const rows = rawData.filter(x=>x.channel===channel && yearOf(x.date)===year).sort((a,b)=>a.date.localeCompare(b.date));
    if(!rows.length) return null;
    const first = rows[0], last = rows[rows.length-1];
    return { channel, subscribers:last.subscribers, views:last.views, videos:last.videos,
      subsGrowth:last.subscribers-first.subscribers,
      viewsGrowth:last.views-first.views,
      videosGrowth:last.videos-first.videos };
  }).filter(Boolean).sort((a,b)=> (b[sortKey]||0)-(a[sortKey]||0));
}

function renderTop(){
  const year = $('topYearSelect').value;
  const sortKey = $('topSortSelect').value;
  const rows = yearlyTop(year, sortKey);
  $('topTable').innerHTML = rows.map((r,i)=>`<tr>
    <td class="rank">${i+1}</td><td>${r.channel}</td><td>${fmt.format(r.subscribers)}</td><td>${fmt.format(r.views)}</td><td>${fmt.format(r.videos)}</td>
    <td>+${fmt.format(r.subsGrowth)}</td><td>+${fmt.format(r.viewsGrowth)}</td><td>+${fmt.format(r.videosGrowth)}</td>
  </tr>`).join('') || '<tr><td colspan="8" class="muted">Нет данных за этот год</td></tr>';
}

function renderHistory(){
  $('historyTable').innerHTML = rawData.slice().reverse().map(x=>`<tr><td>${x.date}</td><td>${x.channel}</td><td>${fmt.format(x.subscribers)}</td><td>${fmt.format(x.views)}</td><td>${fmt.format(x.videos)}</td></tr>`).join('');
}

function renderAll(){ const data=getFiltered(); renderCards(data); renderChart(data); renderTop(); renderHistory(); }
loadData();
