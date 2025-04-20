const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

// ファイルパスの設定
const shopDataPath = path.join(__dirname, 'src', 'app', 'shopData.json');

// shopData.jsonの読み込み
const shopData = JSON.parse(fs.readFileSync(shopDataPath, 'utf8'));

// 星評価を取得する関数
async function getStarRating(url) {
  try {
    console.log(`Fetching: ${url}`);
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // 食べログの星評価を取得（クラス名やセレクタは変更される可能性があります）
    const starText = $('span.rdheader-rating__score-val-dtl').text().trim();

    if (starText) {
      console.log(`Star rating: ${starText}`);
      return parseFloat(starText);
    } else {
      console.log('Star rating not found');
      return null;
    }
  } catch (error) {
    console.error(`Error fetching ${url}: ${error.message}`);
    return null;
  }
}

// 一定時間待機する関数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// メイン処理
async function updateStarRatings() {
  console.log('Starting to update star ratings...');

  // 更新された店舗の数
  let updatedCount = 0;

  // 各店舗の星評価を取得して更新
  for (let i = 0; i < shopData.length; i++) {
    const shop = shopData[i];
    console.log(`Processing shop ${i+1}/${shopData.length}: ${shop.name}`);

    const newStar = await getStarRating(shop.url);

    if (newStar !== null) {
      // 星評価が変わっている場合のみ更新
      if (shop.star !== newStar) {
        console.log(`Updating star rating for ${shop.name}: ${shop.star} -> ${newStar}`);
        shop.star = newStar;
        updatedCount++;
      } else {
        console.log(`Star rating for ${shop.name} is unchanged: ${shop.star}`);
      }
    }

    // 食べログのサーバーに負荷をかけないよう、リクエスト間隔を空ける
    if (i < shopData.length - 1) {
      console.log('Waiting before next request...');
      await sleep(2000); // 2秒待機
    }
  }

  // 更新されたデータをファイルに書き込む
  fs.writeFileSync(shopDataPath, JSON.stringify(shopData, null, 2), 'utf8');

  console.log(`Update completed. ${updatedCount} shops were updated.`);
}

// スクリプトの実行
updateStarRatings().catch(error => {
  console.error('An error occurred:', error);
});
