import { messaging } from '../config/firebase.js';
import { DeviceToken } from '../models/device-token.model.js';

export class PushService {
  async sendToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<void> {
    if (!messaging) {
      console.log('⚠️  FCM not configured — skipping push notification for user:', userId);
      return;
    }

    const deviceTokenDocs = await DeviceToken.find({ userId });
    if (deviceTokenDocs.length === 0) {
      console.log(`No device tokens found for user: ${userId}`);
      return;
    }

    const tokens = deviceTokenDocs.map((d) => d.token);

    try {
      const response = await messaging.sendEachForMulticast({
        tokens,
        notification: { title, body },
        data: data ?? {},
      });

      console.log(
        `📱 FCM sent to ${userId}: ${response.successCount} success, ${response.failureCount} failed`
      );

      // Collect invalid tokens to remove
      const invalidTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error) {
          const code = resp.error.code;
          if (
            code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-registration-token' ||
            code === 'messaging/invalid-argument'
          ) {
            const token = tokens[idx];
            if (token) invalidTokens.push(token);
          }
        }
      });

      if (invalidTokens.length > 0) {
        await DeviceToken.deleteMany({ token: { $in: invalidTokens } });
        console.log(`🗑️  Removed ${invalidTokens.length} invalid device tokens`);
      }
    } catch (error) {
      console.error('❌ FCM multicast error:', error);
    }
  }

  async sendToMultipleUsers(
    userIds: string[],
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<void> {
    if (!messaging) {
      console.log('⚠️  FCM not configured — skipping push notifications for users:', userIds);
      return;
    }

    const deviceTokenDocs = await DeviceToken.find({ userId: { $in: userIds } });
    if (deviceTokenDocs.length === 0) {
      console.log('No device tokens found for provided users');
      return;
    }

    const tokens = deviceTokenDocs.map((d) => d.token);

    try {
      const response = await messaging.sendEachForMulticast({
        tokens,
        notification: { title, body },
        data: data ?? {},
      });

      console.log(
        `📱 FCM batch sent: ${response.successCount} success, ${response.failureCount} failed`
      );

      const invalidTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error) {
          const code = resp.error.code;
          if (
            code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-registration-token' ||
            code === 'messaging/invalid-argument'
          ) {
            const token = tokens[idx];
            if (token) invalidTokens.push(token);
          }
        }
      });

      if (invalidTokens.length > 0) {
        await DeviceToken.deleteMany({ token: { $in: invalidTokens } });
        console.log(`🗑️  Removed ${invalidTokens.length} invalid device tokens`);
      }
    } catch (error) {
      console.error('❌ FCM batch multicast error:', error);
    }
  }
}
