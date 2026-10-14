export type CapturedPhoto = {
  uri: string;
  width: number;
  height: number;
};

export type SavedPhoto = CapturedPhoto & {
  id: string;
  createdAt: string;
};
