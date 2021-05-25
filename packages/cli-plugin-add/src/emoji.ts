export type EmojiType = 'pending' | 'cancelled' | 'submitted';

export const emoji: {
  [key in EmojiType]: string
} = {
  pending: '?', cancelled: '✖', submitted: '✔',
};
