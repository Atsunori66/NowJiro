"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
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
  const [selectedTimeOption, setSelectedTimeOption] = useState<string>("current");
  const [specifiedTime, setSpecifiedTime] = useState<Date>(new Date());
  const [displayTime, setDisplayTime] = useState<Date>(new Date());
  const { setTheme, resolvedTheme } = useTheme();


  useEffect(() => {
    if (selectedTimeOption === "current") {
      setDisplayTime(new Date());
    }
  }, [selectedTimeOption]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (selectedTimeOption === "current") {
        setDisplayTime(new Date());
      }
    }, 60000); // 1分ごとに更新

    return () => clearInterval(timer);
  }, [selectedTimeOption]);

  const year = displayTime.getFullYear().toString();
  const month = (displayTime.getMonth() + 1).toString();
  const date = displayTime.getDate().toString();
  const hours = displayTime.getHours().toString().padStart(2, "0");
  const minutes = displayTime.getMinutes().toString().padStart(2, "0");
  const day: number = displayTime.getDay();
  const weekDays: string[] = ["日", "月", "火", "水", "木", "金", "土"];

  const currentMinutes: number = displayTime.getHours() * 60 + displayTime.getMinutes(); // 現在時刻を分単位で取得

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

    let filteredData = flattenedData;

    if (selectedTimeOption === "specify") {
      const specifiedTotal = specifiedTime.getHours() * 60 + specifiedTime.getMinutes();
      filteredData = flattenedData.filter((shop: ShopData) => {
        const isActiveDay = shop.days.includes(specifiedTime.getDay());
        if (!isActiveDay) return false;

        const [openHour, openMin] = shop.open.split(":").map(Number);
        const [closeHour, closeMin] = shop.close.split(":").map(Number);

        const openTotal = openHour * 60 + openMin;
        const closeTotal = closeHour * 60 + closeMin;

        return openTotal <= specifiedTotal && closeTotal >= specifiedTotal;
      });
    } else {
      const currentTotal = currentMinutes;
      filteredData = flattenedData.filter((shop: ShopData) => {
        const isActiveDay = shop.days.includes(day);
        if (!isActiveDay) return false;

        const [openHour, openMin] = shop.open.split(":").map(Number);
        const [closeHour, closeMin] = shop.close.split(":").map(Number);

        const openTotal = openHour * 60 + openMin;
        const closeTotal = closeHour * 60 + closeMin;

        return openTotal <= currentTotal && closeTotal >= currentTotal;
      });
    }

    setTableData(filteredData);
  }, [day, currentMinutes, selectedTimeOption, specifiedTime]);

  return (
    <div className="grid grid-cols-1 gap-4">

      <header className="m-2 flex">
        <div className="p-4 bg-yellow-300 w-64 text-black font-black text-4xl">
          今いける二郎
        </div>
        {/* テーマカラートグルボタン */}
        <button className="place-self-center gap-4 ml-auto mr-6"
          onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
        >
          {
            resolvedTheme === "light" ?
            <SunIcon aria-hidden="true" className="-mr-1 h-5 w-5 stroke-orange-300 fill-orange-300"></SunIcon>
            :
            resolvedTheme === "dark" ?
            <MoonIcon aria-hidden="true" className="-mr-1 h-5 w-5 stroke-yellow-300 fill-yellow-300"></MoonIcon>
            :
            <SunIcon aria-hidden="true" className="-mr-1 h-5 w-5 stroke-orange-300 fill-orange-300"></SunIcon>
          }
        </button>
      </header>

      <main className="p-4">
        <div className="justify-self-center mb-8 text-sm md:text-lg">
          <p>二郎を食いたくなる衝動というものは実に突発的です。</p>
          <p>「確かに二郎を食いたい、しかし今開いている店舗はどこなんだ」という疑問を解消するために作ってみました。</p>
          <p>＊祝日、臨時休業、年末年始、急な麺切れ等、定休日以外にも休みになっている可能性があります。</p>
          <p>各店舗の SNS 等も併せて確認してください。</p>
        </div>
        <div className="justify-self-center mb-6">
          現在日時: {year}/{month}/{date} ({weekDays[day]}) {hours}:{minutes}
        </div>
        <div className="justify-center flex items-center space-x-4 mb-8">
          <div className="flex items-center">
            <input
              type="radio"
              id="currentTime"
              name="timeOption"
              value="current"
              checked={selectedTimeOption === "current"}
              onChange={() => setSelectedTimeOption("current")}
            />
            <label htmlFor="currentTime" className="ml-2">現在日時を使用する</label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="specifyTime"
              name="timeOption"
              value="specify"
              checked={selectedTimeOption === "specify"}
              onChange={() => setSelectedTimeOption("specify")}
            />
            <label htmlFor="specifyTime" className="ml-2">日時を指定する</label>
          </div>
        </div>

        {selectedTimeOption === "specify" && (
          <div className="flex justify-self-center space-x-2 mb-8">
            <select
              value={specifiedTime.getFullYear()}
              onChange={(e) =>
                setSpecifiedTime(new Date(
                  parseInt(e.target.value),
                  specifiedTime.getMonth(),
                  specifiedTime.getDate(),
                  specifiedTime.getHours(),
                  specifiedTime.getMinutes()
                ))
              }
              className="rounded border p-1"
            >
              {[...Array(10)].map((_, idx) => {
                const yearOption = new Date().getFullYear() - 5 + idx;
                return <option key={yearOption} value={yearOption}>{yearOption}年</option>
              })}
            </select>
            <select
              value={specifiedTime.getMonth() + 1}
              onChange={(e) =>
                setSpecifiedTime(new Date(
                  specifiedTime.getFullYear(),
                  parseInt(e.target.value) - 1,
                  specifiedTime.getDate(),
                  specifiedTime.getHours(),
                  specifiedTime.getMinutes()
                ))
              }
              className="rounded border p-1"
            >
              {[...Array(12)].map((_, idx) => (
                <option key={idx + 1} value={idx + 1}>{idx + 1}月</option>
              ))}
            </select>
            <select
              value={specifiedTime.getDate()}
              onChange={(e) =>
                setSpecifiedTime(new Date(
                  specifiedTime.getFullYear(),
                  specifiedTime.getMonth(),
                  parseInt(e.target.value),
                  specifiedTime.getHours(),
                  specifiedTime.getMinutes()
                ))
              }
              className="rounded border p-1"
            >
              {[...Array(31)].map((_, idx) => (
                <option key={idx + 1} value={idx + 1}>{idx + 1}日</option>
              ))}
            </select>
            <select
              value={specifiedTime.getHours()}
              onChange={(e) =>
                setSpecifiedTime(new Date(
                  specifiedTime.getFullYear(),
                  specifiedTime.getMonth(),
                  specifiedTime.getDate(),
                  parseInt(e.target.value),
                  specifiedTime.getMinutes()
                ))
              }
              className="rounded border p-1"
            >
              {[...Array(24)].map((_, idx) => (
                <option key={idx} value={idx}>{idx}時</option>
              ))}
            </select>
            <select
              value={specifiedTime.getMinutes()}
              onChange={(e) =>
                setSpecifiedTime(new Date(
                  specifiedTime.getFullYear(),
                  specifiedTime.getMonth(),
                  specifiedTime.getDate(),
                  specifiedTime.getHours(),
                  parseInt(e.target.value)
                ))
              }
              className="rounded border p-1"
            >
              {[...Array(60)].map((_, idx) => (
                <option key={idx} value={idx}>{idx}分</option>
              ))}
            </select>
          </div>
        )}

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
