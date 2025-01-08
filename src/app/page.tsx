"use client";

import React, { useEffect, useState } from "react";
import ShopsData from "./dfData.json";

interface Schedule {
  days: number[];
  open: string;
  close: string;
}

interface Shop {
  id: number;
  name: string;
  station: string;
  opening: Schedule[];
}

interface ShopData {
  id: number;
  name: string;
  station: string;
  days: number[];
  open: string;
  close: string;
}

// 型アサーションを使用して ShopsData を Shop[] 型としてキャスト
const Shops: Shop[] = ShopsData as unknown as Shop[];

export default function Home() {
  const today = new Date();
  const year = today.getFullYear().toString();
  const month = (today.getMonth() + 1).toString();
  const date = today.getDate().toString();
  const hours = today.getHours().toString().padStart(2, "0");
  const minutes = today.getMinutes().toString().padStart(2, "0");
  const day: number = today.getDay();
  const weekDays: string[] = ["日", "月", "火", "水", "木", "金", "土"];

  const currentMinutes: number = today.getHours() * 60 + today.getMinutes(); // 現在時刻を分単位で取得

  const [tableData, setTableData] = useState<ShopData[]>([]);

  useEffect(() => {
    const flattenedData: ShopData[] = Shops.flatMap((shop: Shop) =>
      shop.opening.map((schedule: Schedule) => ({
        id: shop.id,
        name: shop.name,
        station: shop.station,
        days: schedule.days, // 数字の配列をそのまま代入
        open: schedule.open,
        close: schedule.close,
      }))
    );

    const filteredData = flattenedData.filter((shop: ShopData) => {
      const isActiveDay = shop.days.includes(day);
      if (!isActiveDay) return false;

      const [openHour, openMin] = shop.open.split(":").map(Number);
      const [closeHour, closeMin] = shop.close.split(":").map(Number);

      const openTotal = openHour * 60 + openMin;
      const closeTotal = closeHour * 60 + closeMin;

      return openTotal <= currentMinutes && closeTotal >= currentMinutes;
    });

    setTableData(filteredData);
  }, [day, currentMinutes]);

  return (
    <div className="grid grid-cols-1 gap-4">

      <header className="p-4 m-2 bg-yellow-300 w-64 font-black text-4xl">
        <div>
          今いける二郎
        </div>
      </header>

      <main className="p-4">

        <div className="text-lg">
          現在時刻: {year}/{month}/{date} ({weekDays[day]}) {hours}:{minutes}
        </div>
        <div>
          <table className="justify-self-center border-collapse border border-slate-400 text-base md:text-lg">
            <thead>
              <tr>
                <th className="border border-slate-400">店名</th>
                <th className="border border-slate-400">最寄駅</th>
                <th className="border border-slate-400">営業日</th>
                <th className="border border-slate-400">開店時間</th>
                <th className="border border-slate-400">閉店時間</th>
              </tr>
            </thead>
            <tbody>
              {
                tableData.map((row: ShopData, index: number) => (
                  <tr key={index}>
                    <td className="border border-slate-400">{row.name}</td>
                    <td className="border border-slate-400">{row.station}</td>
                    <td className="border border-slate-400">
                      {
                        row.days
                          .map((dayNum: number) => weekDays[dayNum])
                          .join(", ")
                      }
                    </td>
                    <td className="border border-slate-400">{row.open}</td>
                    <td className="border border-slate-400">{row.close}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

      </main>

      <footer className="p-4 justify-self-center">
        © {year} Atsuki Sumita
      </footer>
    </div>
  );
}