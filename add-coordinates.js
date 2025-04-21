const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// Google Maps APIキーを.envファイルから取得
const API_KEY = process.env.API_KEY;

// ファイルパスの設定
const shopDataPath = path.join(__dirname, 'src', 'app', 'shopData.json');

// shopData.jsonの読み込み
const shopData = JSON.parse(fs.readFileSync(shopDataPath, 'utf8'));


// 緯度と経度を取得する関数
async function getCoordinates(query) {
  try {
    console.log(`Fetching coordinates for: ${query}`);
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: query + ', Japan', // 日本の地名であることを明示
        language: 'ja',  // 日本語の結果を取得
        region: 'jp',    // 日本の結果を優先
        key: API_KEY
      }
    });

    // レスポンスの詳細をログに出力
    console.log(`Response status: ${response.data.status}`);
    console.log(`Response results length: ${response.data.results.length}`);
    if (response.data.error_message) {
      console.error(`API Error: ${response.data.error_message}`);
    }

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      console.log(`Found coordinates: ${location.lat}, ${location.lng}`);
      return {
        lat: location.lat,
        lng: location.lng
      };
    } else {
      console.log(`No results found for: ${query}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching coordinates for ${query}: ${error.message}`);
    if (error.response) {
      console.error(`Response data: ${JSON.stringify(error.response.data)}`);
    }
    return null;
  }
}

// 一定時間待機する関数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// メイン処理
async function addCoordinates() {
  console.log('Starting to add coordinates to shop data...');

  // 更新された店舗の数
  let updatedCount = 0;

  // 各店舗の緯度と経度を取得して更新
  for (let i = 0; i < shopData.length; i++) {
    const shop = shopData[i];
    console.log(`Processing shop ${i+1}/${shopData.length}: ${shop.name}`);

    // 店舗にすでに緯度と経度が設定されている場合はスキップ
    if (shop.lat && shop.lng) {
      console.log(`Shop ${shop.name} already has coordinates: ${shop.lat}, ${shop.lng}`);
      continue;
    }

    // 店舗名を使用して緯度と経度を取得
    const query = `ラーメン二郎 ${shop.name}`;

    const coordinates = await getCoordinates(query);

    if (coordinates) {
      // 緯度と経度を設定
      shop.lat = coordinates.lat;
      shop.lng = coordinates.lng;
      updatedCount++;
      console.log(`Updated coordinates for ${shop.name}: ${coordinates.lat}, ${coordinates.lng}`);
    }

    // Google Maps APIに負荷をかけないよう、リクエスト間隔を空ける
    if (i < shopData.length - 1) {
      console.log('Waiting before next request...');
      await sleep(1000); // 1秒待機
    }
  }

  // 更新されたデータをファイルに書き込む
  fs.writeFileSync(shopDataPath, JSON.stringify(shopData, null, 2), 'utf8');

  console.log(`Update completed. ${updatedCount} shops were updated with coordinates.`);
}

// スクリプトの実行
addCoordinates().catch(error => {
  console.error('An error occurred:', error);
});
