import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={icons:{icon:'/brand-logo.jpg'},title:'املاک بام یزد | خانه‌ای برای فصل تازه زندگی',description:'جستجوی خرید، فروش، رهن و اجاره ملک در یزد. ثبت ملک توسط مالک و هماهنگی بازدید با مشاوران بام یزد.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fa" dir="rtl"><body>{children}</body></html>}
