let timer = null;
let history = [];
let liveChart = null;

const apiUrlInput = document.getElementById("apiUrl");
const intervalSelect = document.getElementById("intervalSelect");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

function formatNumber(value) {
  return Number(value || 0).toLocaleString("ru-RU");
}

function formatTime(date) {
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function getStatsFromMixerno(json) {
  const item = json.items?.[0];

  if (!item) {
    throw new Error("Mixerno не вернул данные канала");
  }

  const stats = item.statistics || {};
  const snippet = item.snippet || {};

  return {
    title: snippet.title || item.title || "Без названия",
    channelId: item.id || item.channelId || "—",
    avatar:
      snippet.thumbnails?.default?.url ||
      snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.high?.url ||
      "",
    subscribers: Number(stats.subscriberCount || 0),
    views: Number(stats.viewCount || 0),
    videos: Number(stats.videoCount || 0)
  };
}

async function loadMixernoStats() {
  try {
    const url = apiUrlInput.value.trim();

    const response = await fetch(url);
    const json = await response.json();

    const stats = getStatsFromMixerno(json);
    const now = new Date();

    document.getElementById("channelTitle").textContent = stats.title;
    document.getElementById("channelId").textContent = stats.channelId;
    document.getElementById("lastUpdate").textContent =
      "Последнее обновление: " + formatTime(now);

    if (stats.avatar) {
      document.getElementById("channelAvatar").src = stats.avatar;
    }

    document.getElementById("liveSubs").textContent = formatNumber(stats.subscribers);
    document.getElementById("liveViews").textContent = formatNumber(stats.views);
    document.getElementById("liveVideos").textContent = formatNumber(stats.videos);

    history.push({
      time: formatTime(now),
      subscribers: stats.subscribers,
      views: stats.views,
      videos: stats.videos
    });

    // Чтобы браузер не тормозил, держим последние 60 точек.
    if (history.length > 60) {
      history.shift();
    }

    renderChart();
    renderHistory();
  } catch (error) {
    console.error(error);
    document.getElementById("lastUpdate").textContent =
      "Ошибка обновления: " + error.message;
  }
}

function renderChart() {
  const labels = history.map(item => item.time);

  const data = {
    labels,
    datasets: [
      {
        label: "Подписчики",
        data: history.map(item => item.subscribers),
        borderWidth: 2,
        tension: 0.25
      },
      {
        label: "Просмотры",
        data: history.map(item => item.views),
        borderWidth: 2,
        tension: 0.25
      },
      {
        label: "Видео",
        data: history.map(item => item.videos),
        borderWidth: 2,
        tension: 0.25
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#f4f4f4"
        }
      }
    },
    scales: {
      x: {
        ticks: { color: "#cbd5e1" },
        grid: { color: "#273044" }
      },
      y: {
        ticks: { color: "#cbd5e1" },
        grid: { color: "#273044" }
      }
    }
  };

  if (!liveChart) {
    liveChart = new Chart(document.getElementById("liveChart"), {
      type: "line",
      data,
      options
    });
  } else {
    liveChart.data = data;
    liveChart.update();
  }
}

function renderHistory() {
  const tbody = document.getElementById("historyTable");
  tbody.innerHTML = "";

  [...history].reverse().forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.time}</td>
      <td>${formatNumber(item.subscribers)}</td>
      <td>${formatNumber(item.views)}</td>
      <td>${formatNumber(item.videos)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function startLive() {
  stopLive();

  loadMixernoStats();

  timer = setInterval(loadMixernoStats, Number(intervalSelect.value));
}

function stopLive() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

startBtn.addEventListener("click", startLive);
stopBtn.addEventListener("click", stopLive);

startLive();
