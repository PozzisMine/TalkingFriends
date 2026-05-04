const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

const today = new Date().toISOString().slice(0, 10);

// пример канала
const channel = {
  id: "UCDCNmuaOXOo25Yn4mbMHhhQ",
  name: "Talking Tom & Friends TV"
};

// пример (пока вручную)
const stats = {
  subscribers: Math.floor(Math.random() * 1000000),
  views: Math.floor(Math.random() * 100000000),
  videos: Math.floor(Math.random() * 500)
};

const existingIndex = data.findIndex(
  item => item.date === today && item.channelId === channel.id
);

const newRecord = {
  date: today,
  channel: channel.name,
  channelId: channel.id,
  subscribers: stats.subscribers,
  views: stats.views,
  videos: stats.videos
};

if (existingIndex >= 0) {
  data[existingIndex] = newRecord;
} else {
  data.push(newRecord);
}

fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
