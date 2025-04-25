"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import ShopData from "./shopData.json";

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
  url: string;
  star: number;
  lat?: number;  // 緯度
  lng?: number;  // 経度
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
  url: string;
  isActive: boolean;
  lat?: number;  // 緯度
  lng?: number;  // 経度
  distance?: number; // ユーザーの現在地からの距離
}

// ユーザーの位置情報
interface UserLocation {
  lat: number;
  lng: number;
}

// ヘルパー関数: "HH:MM" を分単位に変換
const getMinutes = (time: string): number => {
  const [hour, min] = time.split(":").map(Number);
  return hour * 60 + min;
};

// 型アサーションを使用して ShopData を Shop[] 型としてキャスト
const Shops: Shop[] = ShopData as unknown as Shop[];

export default function Home() {
  const [selectedTimeOption, setSelectedTimeOption] = useState<"current" | "specify">("current")
  const [specifiedTime, setSpecifiedTime] = useState<Date>(new Date());
  const [displayTime, setDisplayTime] = useState<Date>(new Date());
  const { setTheme, resolvedTheme } = useTheme();

  const [tableData, setTableData] = useState<ShopData[]>([]);
  const [sortOrder, setSortOrder] = useState<"id" | "star" | "visited" | "location">("id");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [userLocationName, setUserLocationName] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [visitedShops, setVisitedShops] = useState<string[]>([]);

  // ローカルストレージから訪問済み店舗を読み込む
  useEffect(() => {
    const savedVisitedShops = localStorage.getItem('visitedShops');
    if (savedVisitedShops) {
      setVisitedShops(JSON.parse(savedVisitedShops));
    }
  }, []);

  // 緯度経度から地名を取得する関数
  const getLocationName = async (lat: number, lng: number) => {
    try {
      // APIキーを環境変数から取得
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      // Google Maps Geocoding APIのエンドポイントURL
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=ja&key=${apiKey}`;

      // axiosを使用してAPIリクエストを送信
      const response = await axios.get(url);

      // デバッグ用：APIレスポンスをコンソールに出力
      console.log('Geocoding API Response:', response.data);

      // レスポンスのステータスを確認
      if (response.data.status === 'OK' && response.data.results.length > 0) {
        // 結果から適切な地名を抽出
        const results = response.data.results;

        // 都道府県と市区町村の情報を取得
        let prefecture = null;
        let locality = null;
        let sublocality = null;

        // すべての結果から都道府県と市区町村の情報を探す
        for (const result of results) {
          for (const component of result.address_components) {
            // 都道府県レベル
            if (component.types.includes('administrative_area_level_1')) {
              prefecture = component.long_name;
            }
            // 市区町村レベル
            if (component.types.includes('locality')) {
              locality = component.long_name;
            }
            // 区レベル
            if (component.types.includes('sublocality_level_1')) {
              sublocality = component.long_name;
            }
          }

          // 必要な情報が揃ったら探索を終了
          if (prefecture && (locality || sublocality)) {
            break;
          }
        }

        // 都道府県と市区町村/区の情報を組み合わせて返す
        if (prefecture) {
          if (sublocality) {
            return `${prefecture}${sublocality}`;
          } else if (locality) {
            return `${prefecture}${locality}`;
          } else {
            return prefecture;
          }
        }

        // 適切な地名が見つからない場合は最初の結果の住所を使用
        return results[0].formatted_address.split(',')[0];
      }

      // APIからの応答がない場合や結果がない場合は現在の実装にフォールバック
      // 簡易的な地名取得（APIが失敗した場合のフォールバック）
      if (lat > 35.5 && lat < 35.8 && lng > 139.5 && lng < 140.0) {
        return "東京";
      } else if (lat > 35.3 && lat < 35.6 && lng > 139.5 && lng < 139.8) {
        return "横浜";
      } else if (lat > 34.5 && lat < 34.8 && lng > 135.3 && lng < 135.7) {
        return "大阪";
      } else if (lat > 35.0 && lat < 35.3 && lng > 136.8 && lng < 137.1) {
        return "名古屋";
      } else if (lat > 42.9 && lat < 43.2 && lng > 141.2 && lng < 141.5) {
        return "札幌";
      } else if (lat > 33.5 && lat < 33.7 && lng > 130.3 && lng < 130.6) {
        return "福岡";
      }

      return "不明な地域";
    } catch (error) {
      console.error("地名の取得に失敗しました:", error);

      // エラー時も現在の実装にフォールバック
      if (lat > 35.5 && lat < 35.8 && lng > 139.5 && lng < 140.0) {
        return "東京";
      } else if (lat > 35.3 && lat < 35.6 && lng > 139.5 && lng < 139.8) {
        return "横浜";
      } else if (lat > 34.5 && lat < 34.8 && lng > 135.3 && lng < 135.7) {
        return "大阪";
      } else if (lat > 35.0 && lat < 35.3 && lng > 136.8 && lng < 137.1) {
        return "名古屋";
      } else if (lat > 42.9 && lat < 43.2 && lng > 141.2 && lng < 141.5) {
        return "札幌";
      } else if (lat > 33.5 && lat < 33.7 && lng > 130.3 && lng < 130.6) {
        return "福岡";
      }

      return "不明な地域";
    }
  };

  // ユーザーの現在地を取得する関数
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("お使いのブラウザは位置情報をサポートしていません");
      return;
    }

    setIsLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setUserLocation({ lat, lng });

        // 地名を取得
        const locationName = await getLocationName(lat, lng);
        setUserLocationName(locationName);

        setIsLocationLoading(false);
      },
      (error) => {
        setLocationError("位置情報の取得に失敗しました: " + error.message);
        setIsLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  // 2点間の距離を計算する関数（ユークリッド距離）
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
  };

  // ソート順を変更する関数
  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortOrder = e.target.value as "id" | "star" | "visited" | "location";
    setSortOrder(newSortOrder);

    // 「現在地から近い順」が選択された場合、位置情報を取得
    if (newSortOrder === "location" && !userLocation) {
      getUserLocation();
    }
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

  // ユーザーの現在地が変更されたときにも店舗との距離を再計算する
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

        // 店舗の緯度・経度を取得
        const shopLat = shop.lat;
        const shopLng = shop.lng;

        // ユーザーの現在地からの距離を計算
        let distance = undefined;
        if (userLocation && shopLat && shopLng) {
          distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            shopLat,
            shopLng
          );
        }

        return {
          id: shop.id,
          name: shop.name,
          station: shop.station,
          days: schedule.days,
          open: schedule.open,
          close: schedule.close,
          star: shop.star,
          url: shop.url,
          isActive: isActive,
          lat: shopLat,
          lng: shopLng,
          distance: distance
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
      } else if (sortOrder === "location") {
        // 現在地からの距離でソート
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance; // 距離が近い順
        } else if (a.distance !== undefined) {
          return -1; // aに距離があればaを優先
        } else if (b.distance !== undefined) {
          return 1; // bに距離があればbを優先
        }
        return a.id - b.id; // どちらも距離がない場合はID順
      }
      return 0;
    };

    activeData.sort(sortFunction);
    inactiveData.sort(sortFunction);

    const sortedData = [...activeData, ...inactiveData];

    setTableData(sortedData);
  }, [day, currentMinutes, selectedTimeOption, specifiedTime, sortOrder, userLocation, visitedShops]);

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
          <p>「二郎を食うぞ、どの店舗なら開いているんだ」とすぐに確認するために作りました。</p>
          <br />
          <p>祝日、臨時休業、年末年始、急な麺切れ等、定休日以外にも休みになっている場合があります。</p>
          <p>各店舗の SNS 等も併せて確認してください。</p>
          <br />
          <p>ソートメニューから「標準 / 食べログ / 訪問済 / 現在地からの距離」で並び替えできます。</p>
          <p>各店舗の営業情報は 2025年4月時点のものです。</p>
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

        <div className="flex flex-col justify-center items-center mb-8">
          <div className="flex items-center mb-2">
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
              <option value="location">現在地からの距離</option>
            </select>
          </div>

          {/* 位置情報の状態表示 */}
          {isLocationLoading && (
            <div className="text-sm text-blue-600 dark:text-blue-400">
              位置情報を取得中...
            </div>
          )}
          {locationError && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {locationError}
            </div>
          )}
          {userLocation && sortOrder === "location" && (
            <div className="text-sm text-green-600 dark:text-green-400">
              現在地を取得しました（{userLocationName}）
            </div>
          )}
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
                <th className="hidden md:table-cell border border-slate-400 bg-gray-100 dark:bg-gray-700">最寄駅</th>
                <th className="border border-slate-400 bg-gray-100 dark:bg-gray-700">営業日</th>
                <th className="border border-slate-400 bg-gray-100 dark:bg-gray-700 text-balance">開店時間</th>
                <th className="border border-slate-400 bg-gray-100 dark:bg-gray-700 text-balance">閉店時間</th>
                <th className="border border-slate-400 bg-gray-100 dark:bg-gray-700">食べログ</th>
                {sortOrder === "location" && userLocation && (
                  <th className="hidden md:table-cell border border-slate-400 bg-gray-100 dark:bg-gray-700">距離</th>
                )}
                <th className="border border-slate-400 bg-gray-100 dark:bg-gray-700">訪問済</th>
              </tr>
            </thead>
            <tbody>
              {
                tableData.map((row: ShopData, index: number) => (
                  <tr key={index} className={!row.isActive ? "bg-gray-300 dark:bg-gray-500" : ""}>
                    <td className="border border-slate-400">
                      <a href={row.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline">
                        {row.name}
                      </a>
                    </td>
                    <td className="hidden md:table-cell border border-slate-400">{row.station}</td>
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
                    {sortOrder === "location" && userLocation && (
                      <td className="hidden md:table-cell border border-slate-400">
                        {row.distance !== undefined ? (row.distance * 111).toFixed(2) + " km" : "-"}
                      </td>
                    )}
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
