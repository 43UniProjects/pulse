export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface SerializedPushSubscription {
  endpoint: string;
  expirationTime?: number | null;
  keys: PushSubscriptionKeys;
}

export interface PushSubscriptionEntity {
  _id?: string;
  donorId: string;
  endpoint: string;
  expirationTime?: number | null;
  keys: PushSubscriptionKeys;
  userAgent?: string;
  createdAt?: string;
  updatedAt?: string;
}
