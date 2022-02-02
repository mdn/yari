interface Notification {
  id: number;
  title: string;
  text: string;
  created: Date;
  url: string;
  read: boolean;
  deleted: boolean;
}

interface Metadata {
  page: number;
  total: number;
  per_page: number;
}

interface NotificationData {
  items: Array<Notification>;
  metadata: Metadata;
  csrfmiddlewaretoken: string;
}

export type { Notification, NotificationData };
