import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '今行ける二郎',
    short_name: 'NowJiro',
    description: '今すぐ行ける二郎系ラーメン店を確認できるアプリ',
    start_url: '/',
    display: 'standalone',
    background_color: '#00a6ff',
    theme_color: '#ffd700',
    icons: [
      {
        src: '/icon-500x500.png',
        sizes: '500x500',
        type: 'image/png',
      },
    ],
  }
}