interface Notification {
  id: number;
  title: string;
  text: string;
  created: Date;
  url: string;
  read: boolean;
  deleted: boolean;
}

interface NotificationData {
  items: Array<Notification>;
}

export type { Notification, NotificationData };
