// utils/notifications.js
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

async function sendPushNotifications(messages) {
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (let chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (err) {
      console.error("Error sending push notifications:", err);
    }
  }
  return tickets;
}

module.exports = { sendPushNotifications };
