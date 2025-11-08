import { Expo } from "expo-server-sdk";
const expo = new Expo();

export default async function sendPushNotification(
  pushToken,
  title,
  body,
  type
) {
  if (!Expo.isExpoPushToken(pushToken)) {
    throw new Error(`Invalid Expo push token: ${pushToken}`);
  }
  const message = {
    to: pushToken,
    sound: "default",
    title: title,
    body: body,
    data: {},
    channelId: type,
  };

  try {
    const tickets = await expo.sendPushNotificationsAsync([message]);
    console.log("Notification sent:", tickets);
    return tickets;
  } catch (error) {
    console.error("Failed to send notification:", error);
    throw error;
  }
}
