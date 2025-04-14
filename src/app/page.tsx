"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import ShopsData from "./dfData.json";

// MEMO: インターフェースの定義は通常、ファイルの先頭に配置されます
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
  star: number;
}

// MEMO: ShopとShopDataに重複があります。共通部分を抽出して継承することも検討できます
interface ShopData {
  id: number;
  name: string;
  station: string;
  days: number[];
  open: string;
  close: string;
  star: number;
  isActive: boolean;
}

// ヘルパー関数: "HH:MM" を分単位に変換
const getMinutes = (time: string): number => {
  const [hour, min] = time.split(":").map(Number);
  return hour * 60 + min;
};

// 型アサーションを使用して ShopsData を Shop[] 型としてキャスト
const Shops: Shop[] = ShopsData as unknown as Shop[];

export default function Home() {
  const [selectedTimeOption, setSelectedTimeOption] = useState<"current" | "specify">("current")
  const [specifiedTime, setSpecifiedTime] = useState<Date>(new Date());
  const [displayTime, setDisplayTime] = useState<Date>(new Date());
  const { setTheme, resolvedTheme } = useTheme();

  const [tableData, setTableData] = useState<ShopData[]>([]);
  const [sortOrder, setSortOrder] = useState<"id" | "star" | "visited">("id");
  const [visitedShops, setVisitedShops] = useState<string[]>([]);

  // ローカルストレージから訪問済み店舗を読み込む
  useEffect(() => {
    const savedVisitedShops = localStorage.getItem('visitedShops');
    if (savedVisitedShops) {
      setVisitedShops(JSON.parse(savedVisitedShops));
    }
  }, []);

  // ソート順を変更する関数
  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as "id" | "star" | "visited");
  };

  // 訪問済みの店舗を切り替える関数
  const toggleVisited = (shopName: string) => {
    // 同じ店名の店舗を一括で処理するため、名前だけを使用
    const newVisitedShops = [...visitedShops];

    if (newVisitedShops.includes(shopName)) {
      // 既に訪問済みの場合は削除
      const index = newVisitedShops.indexOf(shopName);
      newVisitedShops.splice(index, 1);
    } else {
      // 未訪問の場合は追加
      newVisitedShops.push(shopName);
    }

    // 状態を更新
    setVisitedShops(newVisitedShops);

    // ローカルストレージに保存
    localStorage.setItem('visitedShops', JSON.stringify(newVisitedShops));
  };

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

  // MEMO: 上記の2つのuseEffectは統合できる可能性があります

  const year = displayTime.getFullYear().toString();
  const month = (displayTime.getMonth() + 1).toString();
  const date = displayTime.getDate().toString();
  const hours = displayTime.getHours().toString().padStart(2, "0");
  const minutes = displayTime.getMinutes().toString().padStart(2, "0");
  const day: number = displayTime.getDay();
  const weekDays: string[] = ["日", "月", "火", "水", "木", "金", "土"];

  const currentMinutes: number = displayTime.getHours() * 60 + displayTime.getMinutes(); // 現在時刻を分単位で取得

  useEffect(() => {
    const flattenedData: ShopData[] = Shops.flatMap((shop: Shop) =>
      shop.opening.map((schedule: Schedule) => {
        let isActive = false;
        const openTotal = getMinutes(schedule.open);
        const closeTotalRaw = getMinutes(schedule.close);

        let closeTotal = closeTotalRaw;
        let isOverMidnight = false;

        if (closeTotalRaw > 1440) {
          closeTotal = closeTotalRaw - 1440; // 翌日の時間
          isOverMidnight = true;
        }

        // MEMO: 以下の条件分岐は共通化できる可能性があります
        if (selectedTimeOption === "specify") {
          const specifiedTotal = specifiedTime.getHours() * 60 + specifiedTime.getMinutes();
          const isActiveDay = schedule.days.includes(specifiedTime.getDay());
          if (isActiveDay) {
            if (isOverMidnight) {
              if (specifiedTotal >= openTotal || specifiedTotal < closeTotal) {
                isActive = true;
              }
            } else {
              if (openTotal <= specifiedTotal && specifiedTotal < closeTotal) {
                isActive = true;
              }
            }
          }
        } else {
          const currentTotal = currentMinutes;
          const isActiveDay = schedule.days.includes(day);
          if (isActiveDay) {
            if (isOverMidnight) {
              if (currentTotal >= openTotal || currentTotal < closeTotal) {
                isActive = true;
              }
            } else {
              if (openTotal <= currentTotal && currentTotal < closeTotal) {
                isActive = true;
              }
            }
          }
        }

        return {
          id: shop.id,
          name: shop.name,
          station: shop.station,
          days: schedule.days,
          open: schedule.open,
          close: schedule.close,
          star: shop.star,
          isActive: isActive
        };
      })
    );

    const activeData = flattenedData.filter(data => data.isActive);
    const inactiveData = flattenedData.filter(data => !data.isActive);

    const sortFunction = (a: ShopData, b: ShopData) => {
      if (sortOrder === "id") {
        return a.id - b.id;
      } else if (sortOrder === "star") {
        return b.star - a.star;
      } else if (sortOrder === "visited") {
        // 訪問済みの店舗を優先し、その中では標準順（ID順）でソート
        const aVisited = visitedShops.includes(a.name);
        const bVisited = visitedShops.includes(b.name);

        if (aVisited && !bVisited) return -1;
        if (!aVisited && bVisited) return 1;
        return a.id - b.id; // 両方訪問済みまたは両方未訪問の場合はID順
      }
      return 0;
    };

    activeData.sort(sortFunction);
    inactiveData.sort(sortFunction);

    const sortedData = [...activeData, ...inactiveData];

    setTableData(sortedData);
  }, [day, currentMinutes, selectedTimeOption, specifiedTime, sortOrder]);

  return (
    <div className="grid gap-4">

      <header className="m-2 flex">
        <div className="p-4 bg-yellow-300 w-64 text-black font-black text-4xl">
          今行ける二郎
        </div>
        {/* テーマカラートグルボタン */}
        <button className="place-self-center ml-auto mr-6"
          onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
        >
          {
            resolvedTheme === "dark"
              ? <MoonIcon aria-hidden="true" className="-mr-1 h-5 w-5 stroke-yellow-300 fill-yellow-300" />
              : <SunIcon aria-hidden="true" className="-mr-1 h-5 w-5 stroke-orange-300 fill-orange-300" />
          }
        </button>
      </header>

      <main className="p-4">
        <div className="justify-self-center mb-8 text-sm md:text-lg">
          <p>二郎を食らいたい衝動は常に突発的なものです。</p>
          <p>「二郎を食うぞ、今開いている店舗はどこだ」とすぐに確認するために作りました。</p>
          <br />
          <p>祝日、臨時休業、年末年始、急な麺切れ等、定休日以外にも休みになっている可能性があります。</p>
          <p>各店舗の SNS 等も併せて確認してください。</p>
          <br />
          <p>ソートメニューから「標準」「食べログ」「訪問済」の順序を選択できます。</p>
          <p>営業情報、食べログの★は 2025年3月時点のものです。</p>
        </div>
        <div className="text-center mb-6">
          現在日時: {year}/{month}/{date} ({weekDays[day]}) {hours}:{minutes}
        </div>
        <div className="flex justify-center items-center space-x-4 mb-8">
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

        <div className="flex justify-center items-center mb-8">
          <label htmlFor="sortOrder" className="mr-2">ソート順:</label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={handleSortOrderChange}
            className="rounded border p-1"
          >
            <option value="id">標準</option>
            <option value="star">食べログ</option>
            <option value="visited">訪問済</option>
          </select>
        </div>

        {selectedTimeOption === "specify" && (
          <div className="flex justify-center space-x-2 mb-8">
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
          <table className="justify-self-center border-collapse border border-slate-400 text-sm md:text-lg">
            <thead>
              <tr>
                <th className="border border-slate-400 bg-gray-100 dark:bg-gray-700">店名</th>
                <th className="border border-slate-400 bg-gray-100 dark:bg-gray-700">最寄駅</th>
                <th className="border border-slate-400 bg-gray-100 dark:bg-gray-700">営業日</th>
                {/* MEMO: text-balanceは短いテキストには効果が薄く、不要かもしれません */}
                <th className="border border-slate-400 bg-gray-100 dark:bg-gray-700 text-balance">開店時間</th>
                <th className="border border-slate-400 bg-gray-100 dark:bg-gray-700 text-balance">閉店時間</th>
                <th className="border border-slate-400 bg-gray-100 dark:bg-gray-700">食べログ</th>
                <th className="border border-slate-400 bg-gray-100 dark:bg-gray-700">訪問済</th>
              </tr>
            </thead>
            <tbody>
              {
                tableData.map((row: ShopData, index: number) => (
                  <tr key={index} className={!row.isActive ? "bg-gray-300 dark:bg-gray-500" : ""}>
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
                    <td className="border border-slate-400">★ {row.star}</td>
                    <td className="border border-slate-400 text-center">
                      <input
                        type="checkbox"
                        checked={visitedShops.includes(row.name)}
                        onChange={() => toggleVisited(row.name)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

      </main>

      <footer className="p-4 text-center">
        &copy; {year} nowjiro.com
      </footer>
    </div>
  );
};
