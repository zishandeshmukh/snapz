import { useEffect, useState } from 'react';
import * as Intent from 'expo-share-intent';

export default function useShareIntent() {
  const [text, setText] = useState(null);
  useEffect(() => {
    Intent.getShareIntent().then((i) => i?.text && setText(i.text));
    const sub = Intent.addShareIntentListener((i) => i?.text && setText(i.text));
    return () => sub?.remove();
  }, []);
  return text;
}