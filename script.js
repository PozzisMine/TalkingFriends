let subsChart;
let viewsChart;
let allData = [];
let currentChannelId = '';

const formatNumber = (num) => new Intl.NumberFormat('ru-RU').format(num);
const getYear = (date) => new Date(date).getFullYear().toString();

function getGrowth(history, key) {
  if (history.length < 2) return 'Недостаточно данных';
  const last = history[history.length - 1][key];
  const prev = history[history.length - 2][key];
  const diff = last - prev;
  const sign = diff >= 0 ? '+' : '';
  return `${sign}${formatNumber(diff)} за день`;
}

function getChannel(channelId) {
  return allData.find(item => item.id === channelId);
}

function getSortedHistory(channel) {
  return [...channel.history].sort((a, b) => new Date(a.date) - new Date(b.date));
}

function fillYearSelect(channelId) {
  const channel = getChannel(channelId);
  const yearSelect = document.getElementById('yearSelect');
  const oldValue = yearSelect.value;
  const years = [...new Set(getSortedHistory(channel).map(row => getYear(row.date)))];

  yearSelect.innerHTML = '<option value="all">Все годы</option>';
  years.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  });

  if (oldValue && (oldValue === 'all' || years.includes(oldValue))) {
    yearSelect.value = oldValue;
  } else {
    yearSelect.value = 'all';
  }
}

function getFilteredHistory(channel) {
  const selectedYear = document.getElementById('yearSelect').value;
  const history = getSortedHistory(channel);
  if (selectedYear === 'all') return history;
  return history.filter(row => getYear(row.date) === selectedYear);
}

function renderChannel(channelId) {
  const channel = getChannel(channelId);
  if (!channel) return;
  currentChannelId = channelId;

  const fullHistory = getSortedHistory(channel);
  const history = getFilteredHistory(channel);
  const last = history[history.length - 1] || fullHistory[fullHistory.length - 1];

  document.getElementById('channelAvatar').src = channel.avatar;
  document.getElementById('channelName').textContent = channel.name;
  document.getElementById('channelDescription').textContent = channel.description;
  document.getElementById('subsNow').textContent = formatNumber(last.subscribers);
  document.getElementById('viewsNow').textContent = formatNumber(last.views);
  document.getElementById('videosNow').textContent = formatNumber(last.videos);
  document.getElementById('lastDate').textContent = last.date;

  document.getElementById('subsGrowth').textContent = getGrowth(history, 'subscribers');
  document.getElementById('viewsGrowth').textContent = getGrowth(history, 'views');
  document.getElementById('videosGrowth').textContent = getGrowth(history, 'videos');

  renderTable(history);
  renderCharts(history);
}

function renderTable(history) {
  const tbody = document.getElementById('historyTable');
  tbody.innerHTML = '';

  history.slice().reverse().forEach((row, index) => {
    const originalIndex = history.length - 1 - index;
    const prev = history[originalIndex - 1];
    const growth = prev ? row.subscribers - prev.subscribers : 0;
    const sign = growth >= 0 ? '+' : '';

    tbody.innerHTML += `
      <tr>
        <td>${row.date}</td>
        <td>${formatNumber(row.subscribers)}</td>
        <td>${formatNumber(row.views)}</td>
        <td>${formatNumber(row.videos)}</td>
        <td>${prev ? sign + formatNumber(growth) : '—'}</td>
      </tr>
    `;
  });
}

function chartOptions() {
  return {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: { labels: { color: '#e5e7eb' } },
      zoom: {
        limits: {
          x: { min: 'original', max: 'original' },
          y: { min: 'original', max: 'original' }
        },
        pan: {
          enabled: true,
          mode: 'x'
        },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: 'x'
        }
      }
    },
    scales: {
      x: { ticks: { color: '#9ca3af' }, grid: { color: '#1f2937' } },
      y: { ticks: { color: '#9ca3af' }, grid: { color: '#1f2937' } }
    }
  };
}

function renderCharts(history) {
  const labels = history.map(row => row.date);
  const subscribers = history.map(row => row.subscribers);
  const views = history.map(row => row.views);

  if (subsChart) subsChart.destroy();
  if (viewsChart) viewsChart.destroy();

  subsChart = new Chart(document.getElementById('subsChart'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Подписчики',
        data: subscribers,
        tension: 0.3,
        pointRadius: 4
      }]
    },
    options: chartOptions()
  });

  viewsChart = new Chart(document.getElementById('viewsChart'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Просмотры',
        data: views,
        tension: 0.3,
        pointRadius: 4
      }]
    },
    options: chartOptions()
  });
}

function resetZoom() {
  if (subsChart) subsChart.resetZoom();
  if (viewsChart) viewsChart.resetZoom();
}

async function init() {
  const response = await fetch('data.json');
  allData = await response.json();

  const channelSelect = document.getElementById('channelSelect');
  const yearSelect = document.getElementById('yearSelect');
  const resetZoomBtn = document.getElementById('resetZoomBtn');

  allData.forEach(channel => {
    const option = document.createElement('option');
    option.value = channel.id;
    option.textContent = channel.name;
    channelSelect.appendChild(option);
  });

  channelSelect.addEventListener('change', () => {
    fillYearSelect(channelSelect.value);
    renderChannel(channelSelect.value);
  });

  yearSelect.addEventListener('change', () => renderChannel(currentChannelId));
  resetZoomBtn.addEventListener('click', resetZoom);

  currentChannelId = allData[0].id;
  fillYearSelect(currentChannelId);
  renderChannel(currentChannelId);
}

init();
