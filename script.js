let subsChart;
let viewsChart;
let allData = [];

const formatNumber = (num) => new Intl.NumberFormat('ru-RU').format(num);

function getGrowth(history, key) {
  if (history.length < 2) return 'Недостаточно данных';
  const last = history[history.length - 1][key];
  const prev = history[history.length - 2][key];
  const diff = last - prev;
  const sign = diff >= 0 ? '+' : '';
  return `${sign}${formatNumber(diff)} за день`;
}

function renderChannel(channelId) {
  const channel = allData.find(item => item.id === channelId);
  if (!channel) return;

  const history = [...channel.history].sort((a, b) => new Date(a.date) - new Date(b.date));
  const last = history[history.length - 1];

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

  history.slice().reverse().forEach((row, index, reversedArray) => {
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
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#e5e7eb' } }
      },
      scales: {
        x: { ticks: { color: '#9ca3af' } },
        y: { ticks: { color: '#9ca3af' } }
      }
    }
  });

  viewsChart = new Chart(document.getElementById('viewsChart'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Просмотры',
        data: views,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#e5e7eb' } }
      },
      scales: {
        x: { ticks: { color: '#9ca3af' } },
        y: { ticks: { color: '#9ca3af' } }
      }
    }
  });
}

async function init() {
  const response = await fetch('data.json');
  allData = await response.json();

  const select = document.getElementById('channelSelect');
  allData.forEach(channel => {
    const option = document.createElement('option');
    option.value = channel.id;
    option.textContent = channel.name;
    select.appendChild(option);
  });

  select.addEventListener('change', () => renderChannel(select.value));
  renderChannel(allData[0].id);
}

init();
