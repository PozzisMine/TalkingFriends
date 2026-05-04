const fs = require("fs");

const API_KEY = process.env.YOUTUBE_API_KEY;

if (!API_KEY) {
  throw new Error("YOUTUBE_API_KEY не найден");
}

const dataPath = "data.json";
const channelsPath = "channels.json";

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const channels = JSON.parse(fs.readFileSync(channelsPath, "utf8"));

const today = new Date().toISOString().slice(0, 10);

async function getStats(channelId) {
  const url =
    `https://www.googleapis.com/youtube/v3/channels` +
    `?part=snippet,statistics&id=${channelId}&key=${API_KEY}`;

  const res = await fetch(url);
  const json = await res.json();

  if (!json.items || json.items.length === 0) {
    throw new Error(`Канал не найден: ${channelId}`);
  }

  const item = json.items[0];

  return {
    title: item.snippet.title,
    subscribers: Number(item.statistics.subscriberCount || 0),
    views: Number(item.statistics.viewCount || 0),
    videos: Number(item.statistics.videoCount || 0)
  };
}

(async () => {
  for (const channel of channels) {
    const stats = await getStats(channel.channelId);

    const newRecord = {
      date: today,
      channel: channel.name || stats.title,
      channelId: channel.channelId,
      subscribers: stats.subscribers,
      views: stats.views,
      videos: stats.videos
    };

    const index = data.findIndex(
      item => item.date === today && item.channelId === channel.channelId
    );

    if (index >= 0) {
      data[index] = newRecord;
    } else {
      data.push(newRecord);
    }
  }

  data.sort((a, b) => {
    if (a.channelId !== b.channelId) {
      return a.channel.localeCompare(b.channel);
    }
    return a.date.localeCompare(b.date);
  });

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
})();
