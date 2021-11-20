'use strict';

// CSVファイルから読みだす処理
// node.js のモジュールを呼び出す
// fs : FileSystem モジュール
const fs = require('fs');
// readline: ファイルを1行ずつ読み込む readline モジュール
const readline = require('readline');

// ファイルの読み込みを行う Stream を生成 ReadlineStream
const rs = fs.createReadStream('./popu-pref.csv');
// Stream のインターフェースを生成、入力に rs を指定
const rl = readline.createInterface({ input: rs, output: {} });

// データを格納する連想配列
// key : 都道府県名
// value : 集計データオブジェクト
// value = {popu2010: 2010年データ, popu2015: 2015年データ}
const prefectureDataMap = new Map();

// 'line' イベントが発生したら呼び出す処理
rl.on('line', lineString => {
    // splitメソッドで columns 配列を作る
    // 文字列型 subString が返ってくるので、数値は数値型に変換
    const columns = lineString.split(',');
    const year = parseInt(columns[0]);
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);

    if (year === 2010 || year === 2015) {
        let value = prefectureDataMap.get(prefecture);
        if (!value) {
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        if (year === 2010) {
            value.popu10 = popu;
        }
        if (year === 2015) {
            value.popu15 = popu;
        }
        prefectureDataMap.set(prefecture, value);
    }
});

// ファイルを読み込み終わった=クローズする時に呼び出す処理
rl.on('close', () => {
    for (const [key, value] of prefectureDataMap) {
        value.change = value.popu15 / value.popu10;
    }
    // 変化率でソートする
    //  Array.from() メソッド：連想配列を配列化する(sortメソッドのために使用)
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        // 比較関数
        // pair2 が pair1 よりも大きいときに正の整数を返す
        return pair2[1].change - pair1[1].change;
    });
    // Array.mapメソッド:
    // Array の要素を与えられた関数に適した内容に変換する
    const rankingStrings = rankingArray.map(([key, value]) => {
        return (
            key +
            ': ' +
            value.popu10 +
            '=>' +
            value.popu15 +
            ' 変化率:' +
            value.change
        );
    });
    console.log(rankingStrings);
});
