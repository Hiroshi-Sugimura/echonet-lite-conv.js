# echonet-lite-conv.js

[![npm version](https://badge.fury.io/js/echonet-lite-conv.svg)](https://badge.fury.io/js/echonet-lite-conv)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Test Status](https://img.shields.io/badge/tests-154%20passing-brightgreen)](https://github.com/hiroshi-sugimura/echonet-lite-conv.js)

## Overview，概要

このモジュールは**ECHONET Liteプロトコルのコンバーター**として機能します．
基本的に，[echonet-lite.js](https://www.npmjs.com/package/echonet-lite)とセットで利用することを想定していますが単体でも利用できます．

This module provides **converter for ECHONET Lite protocol**.
The module to process ECHONET Lite protocol is [here](https://www.npmjs.com/package/echonet-lite).

## 主な機能 / Key Features

- ✅ **プロトコル変換**: ECHONET LiteのバイナリデータとJSON形式の相互変換
- ✅ **辞書サポート**: ECHONET Lite Release G/H/I、Spec 1.11/1.12対応
- ✅ **機器対応**: スマート電力量メータ、分電盤メータリング、家電機器など
- ✅ **EDT解析**: 各種データタイプ（数値、文字列、日時、ビットマップなど）に対応
- ✅ **エンコーディング**: ASCII、Shift_JIS文字列のサポート
- ✅ **TypeScript型定義**: JSDocによる完全な型ヒント
- ✅ **高信頼性**: 154のテストケースで品質保証


## Documentation / ドキュメント

📖 **APIマニュアル**: http://hiroshi-sugimura.github.io/echonet-lite-conv.js/

JSDocで自動生成されたAPIマニュアルがGitHub Pagesで公開されています。

API documentation is automatically generated with JSDoc and published on GitHub Pages.

### ドキュメント生成について / About Documentation Generation

このプロジェクトはGitHub Actionsを使用してAPIドキュメントを自動生成しています。

- **トリガー**: `main`ブランチへのプッシュ時
- **ツール**: JSDoc 3.10+ with Docdash theme
- **出力先**: `docs/` フォルダ（GitHub Pages対応）
- **閲覧**: https://hiroshi-sugimura.github.io/echonet-lite-conv.js/

ローカルでドキュメントを生成する場合:

```bash
npm install --save-dev jsdoc docdash
npx jsdoc -c jsdoc.json
```


## Install，インストール

下記コマンドでインストールされます．

Install this module.

```
 > npm install echonet-lite-conv
```

### Dependencies, 依存関係
このモジュールは"encoding-japanese"の"^1.0.25."に依存しています．
package.jsonが自動的にインストールしてくれる予定です．

This module depends on "encoding-japanese": "^1.0.25."
The package.json will solve dependencies.

## Unit Test / 単体テスト

このリポジトリには `unitTest/` フォルダに Mocha + Chai のテストを配置しています。

### Run tests / テスト実行:

```bash
npm install
npm test
```

### テストファイル構成 / Test Files Structure:

- **basic.spec.js**: 基本的なユーティリティ関数のテスト (toHexString, toHexArray, 日時変換関数など)
- **utils.spec.js**: ヘルパー関数のテスト (ASCII/ShiftJIS変換, ビットマップ, プロパティマップなど)
- **parseEDT.spec.js**: EDT解析とEOJ/EPC参照関数のテスト
- **distribution.spec.js**: 分電盤メータリング(0x0287)関連のテスト
- **smartMeter.spec.js**: スマート電力量メータ(0x0288, 0x028D)関連のテスト
- **error.spec.js**: エラーハンドリングとエッジケースのテスト
- **integration.spec.js**: 統合テスト (EDTconvination, refer関数など)

### テスト追加方法 / How to add tests:

1. `unitTest/` に `*.spec.js` という名前でファイルを作成
2. `const { expect } = require('chai');` を使い `expect` アサーションで記述
3. `npm test` で確認

最初のサンプルは `unitTest/basic.spec.js` を参考にしてね。

### テストカバレッジ / Test Coverage:

現在のテストでは以下の機能をカバーしています:

- ✅ 16進数変換 (toHexString, toHexArray)
- ✅ 日時フォーマット変換 (YYMD, HMS, HMF, MS)
- ✅ 文字エンコーディング変換 (ASCII, Shift_JIS)
- ✅ ビットマップ・プロパティマップ解析
- ✅ EOJ/EPC参照とEDT解析
- ✅ 分電盤メータリング各種EPC
- ✅ スマート電力量メータ各種EPC
- ✅ エラーハンドリングとエッジケース
- ✅ 統合テスト (複数EPCの組み合わせ処理)




## Demos

下記のように使えます．

An example of a script is following:

```JavaScript:example
//==================================
// EL最小構成, EL minimum sample
// ECHONET Liteのコンバーターを準備, ready this module
var ELconv = require('echonet-lite-conv');
//==================================
// コンバータを初期化しておく（JSON形式の定義データを読む）, initialize this module
ELconv.initialize();
//==================================
// require('echonet-lite') で利用される EL.facilities の受信データがこんな感じで管理されるので
// facilities are managed by 'echonet-lite' module.
var facilities =
{ '192.168.2.104':
   { '05ff01': { '80': '30', d6: '' },
     '0ef001': { d6: '0105ff01' } },
  '192.168.2.127': { '0ef001': { '80': '30', d6: '0105fe01' } },
  '192.168.2.148': { '05ff01': { d6: '' } },
  '192.168.2.159':
   { '029001': { '80': '31', d5: '01029001' },
     '0ef001': { '80': '30' } },
  '192.168.2.115':
   { '013501':
      { '80': '31',
        f2: '400000000000000000000000000000000000020000ff0000ffff3100',
        c0: '42',
        '01': '' } },
    '192.168.2.103': { '05ff01': { '80': '', d6: '' } } };
//==================================
// こんな感じでテキスト参照に変換できる
// converter works as follow.
ELconv.refer( facilities, function( devs ) {
    console.dir(devs);  // result
});
```


* result (= devs in ELconv.refer function)

console.dir( devs );

```JavaScript:output
{ IPs:
   [ '192.168.0.35', ...],
  '192.168.0.35':
   { EOJs: [ 'ノードプロファイル01(0ef001)', 'コントローラ01(05ff01)' ],
     'ノードプロファイル01(0ef001)':
      { EPCs:
         [ '動作状態(80)',
           'Version情報(82)',
           '識別番号(83)',
           'インスタンスリスト通知(D5)',
           '自ノードインスタンスリストS(D6)',
           '状変アナウンスプロパティマップ(9D)',
           'Setプロパティマップ(9E)',
           'Getプロパティマップ(9F)',
           'メーカコード(8A)',
           '自ノードインスタンス数(D3)',
           '自ノードクラス数(D4)',
           '自ノードクラスリストS(D7)' ],
        '動作状態(80)': 'ON(30)',
        'Version情報(82)': 'referSpec(010A0100)',
        '識別番号(83)': 'referSpec(FE00000000000000000000000000000000)',
        'インスタンスリスト通知(D5)': 'keyValues(0105FF01)',
        '自ノードインスタンスリストS(D6)': 'コントローラ01(0105FF01)',
        '状変アナウンスプロパティマップ(9D)': 'referSpec(0280D5)',
        'Setプロパティマップ(9E)': 'referSpec(00)',
        'Getプロパティマップ(9F)': 'referSpec(098082838AD3D4D5D6D7)',
        'メーカコード(8A)': 'referSpec(000077)',
        '自ノードインスタンス数(D3)': '1(000001)',
        '自ノードクラス数(D4)': '2(0002)',
        '自ノードクラスリストS(D7)': 'コントローラ(0105FF)' },
     'コントローラ01(05ff01)': { EPCs: [ '動作状態(80)' ], '動作状態(80)': 'ON(30)' } },
.
.
.
```


## Stracture of input facilities data

```
{ '192.168.2.103':
   { '05ff01': { '80': '', d6: '' },
     '0ef001': { '80': '30', d6: '0100' } },
  '192.168.2.104': { '0ef001': { d6: '0105ff01' }, '05ff01': { '80': '30' } },
  '192.168.2.115': { '0ef001': { '80': '30', d6: '01013501' } } }
```


## Stracture of result data

```
{ IPs: [ '<ip1>', '<ip2>' ],
  '<ip1>': { EPCs: [ '<epc1>', '<epc2>' ],
            '<epc1>': '<edt1>',
            '<epc2>': '<edt2>'
           }
  '<ip2>': { EPCs: [ '<epc3>', '<epc4>'],
            '<epc3>': '<edt3>',
            '<epc4>': '<edt4>'
           }
}
```



[Here](https://www.npmjs.com/package/echonet-lite) helps you to use this stracture and to communicate the ECHONET Lite protocol.


## API

### 初期化 / Initialization

コンバータを初期化しておく（JSON形式の定義データを読む）

First, you must initialize this converter.

```javascript
const ELconv = require('echonet-lite-conv');

// 初期化（辞書データを読み込む）
ELconv.initialize();
```

### 主要API / Main APIs

#### 1. `refer(facilities, callback)` - データ参照変換

facilitiesデータを人間が読みやすい形式に変換します。

Convert facilities data to human-readable format.

```javascript
ELconv.refer(facilities, function(devs) {
    console.dir(devs);  // 変換結果
});
```

#### 2. `EDTconvination(eoj, epc_array)` - EDT組み合わせ

**注意**: 正しい名前は `EDTCombination` です（後方互換のため両方使用可能）

Note: Correct name is `EDTCombination` (both available for backward compatibility)

```javascript
// 新しい名前（推奨）
const edt = ELconv.EDTCombination('0x0288', ['0xE0', '0xE1']);

// 古い名前（非推奨だが互換性のため使用可能）
const edt = ELconv.EDTconvination('0x0288', ['0xE0', '0xE1']);
```

#### 3. `elsAnarysis(els, callback)` - ELS構造解析

**注意**: 正しい名前は `elsAnalysis` です（後方互換のため両方使用可能）

Note: Correct name is `elsAnalysis` (both available for backward compatibility)

```javascript
const els = {
    TID: '0001',
    SEOJ: '05FF01',
    DEOJ: '028801',
    ESV: '62',
    OPC: 1,
    DETAILs: { '0xE0': Buffer.from([0x00, 0x00, 0x00, 0x01]) }
};

// 新しい名前（推奨）
ELconv.elsAnalysis(els, function(result) {
    console.log(result);
});

// 古い名前（非推奨だが互換性のため使用可能）
ELconv.elsAnarysis(els, function(result) {
    console.log(result);
});
```

#### 4. `parseEDT(eoj, epc, edt)` - EDT解析

EDT（ECHONET Data）を解析して意味のあるデータに変換します。

Parse EDT (ECHONET Data) to meaningful values.

```javascript
const result = ELconv.parseEDT('0x0288', '0xE0', Buffer.from([0x00, 0x00, 0x00, 0x01]));
console.log(result);  // { val: 1, unit: 'kWh', ... }
```

#### 5. `refEOJ(eoj)` - EOJ参照

EOJ（ECHONET Object）を機器名に変換します。

Convert EOJ to device name.

```javascript
const name = ELconv.refEOJ('0x028801');
console.log(name);  // '低圧スマート電力量メータ01(028801)'
```

#### 6. `refEPC(eoj, epc)` - EPC参照

EPC（ECHONET Property）をプロパティ名に変換します。

Convert EPC to property name.

```javascript
const propName = ELconv.refEPC('0x0288', '0xE0');
console.log(propName);  // '積算電力量計測値(正方向計測値)(E0)'
```

#### 7. `refESV(esv)` - ESV参照

ESV（ECHONET Service）をサービス名に変換します（大文字小文字の違いを自動的に吸収）。

Convert ESV to service name (automatically handles case differences).

```javascript
const serviceName = ELconv.refESV('62');  // '62'でも'6E'でも同じ
console.log(serviceName);  // 'Get_Res(62)'
```

### ユーティリティAPI / Utility APIs

#### データ変換関数 / Data Conversion Functions

```javascript
// 16進数文字列変換
ELconv.toHexString(buffer);  // Buffer → '0A1B2C'

// 16進数配列変換
ELconv.toHexArray('0A1B2C');  // '0A1B2C' → [0x0A, 0x1B, 0x2C]

// 日時フォーマット
ELconv.YYMD([0x07, 0xE9, 0x0C, 0x1F]);  // → '2025/12/31'
ELconv.HMS([0x17, 0x3B, 0x3B]);  // → '23:59:59'

// ASCII文字列変換
ELconv.parseASCII(buffer);

// Shift_JIS文字列変換
ELconv.parseShiftJIS(buffer);
```



## ECHONET Lite Converter 攻略情報 / Usage Tips

Demosを見ればだいたいわかると思う．EDTにアクセスするには例えば，

For using this module, data accessing sample is following.

```javascript
const ip  = devs.IPs[3];              // '192.168.2.159'
const eoj = devs[ip].EOJs[1];         // 'Node profile01'
const epc = devs[ip][eoj].EPCs[0];    // 'Operation status'
const edt = devs[ip][eoj][epc];       // '30'
console.log(edt);
```

### よくあるユースケース / Common Use Cases

#### 1. スマート電力量メータの積算電力量を取得

```javascript
ELconv.initialize();

const facilities = {
    '192.168.1.100': {
        '028801': {
            'E0': Buffer.from([0x00, 0x00, 0x12, 0x34])  // 0x1234 = 4660 (0.1kWh単位)
        }
    }
};

ELconv.refer(facilities, (devs) => {
    const ip = devs.IPs[0];
    const meter = devs[ip]['低圧スマート電力量メータ01(028801)'];
    console.log(meter['積算電力量計測値(正方向計測値)(E0)']);
    // 出力例: '4660 [0.1kWh] (00001234)'
});
```

#### 2. 複数プロパティの一括取得

```javascript
const edt = ELconv.EDTCombination('0x0288', ['0xE0', 'E1', 'E3']);
console.log(edt);
// 積算電力量(正方向/逆方向)と瞬時電力の組み合わせEDTを取得
```

#### 3. 受信データの解析

```javascript
const receivedELS = {
    TID: '0001',
    SEOJ: '028801',  // スマートメータ
    DEOJ: '05FF01',  // コントローラ
    ESV: '72',       // Get_Res
    OPC: 1,
    DETAILs: {
        'E7': Buffer.from([0x00, 0x00, 0x03, 0xE8])  // 瞬時電力 1000W
    }
};

ELconv.elsAnalysis(receivedELS, (result) => {
    console.log(result.ESV);   // 'Get_Res(72)'
    console.log(result.SEOJ);  // '低圧スマート電力量メータ01(028801)'
    console.log(result.EDT);   // 解析済みのプロパティ値
});
```


## Memo

下記ファイルが辞書になっている．

Following files are the dictionary for ECHONET Lite in JSON format.

* ./node_modules/echonet-lite-conv/Appendix_G/deviceObject_G.json
* ./node_modules/echonet-lite-conv/Appendix_G/superClass_G.json
* ./node_modules/echonet-lite-conv/Appendix_H/deviceObject_H.json
* ./node_modules/echonet-lite-conv/Appendix_H/superClass_H.json
* ./node_modules/echonet-lite-conv/Appendix_I/deviceObject_I.json
* ./node_modules/echonet-lite-conv/Appendix_I/superClass_I.json
* ./node_modules/echonet-lite-conv/Spec_1.11/nodeProfile.json
* ./node_modules/echonet-lite-conv/Spec_1.12/nodeProfile.json


### ECHONET Lite versions

* 2011.12.21 Appendix A (J)
* 2011.12.21 Spec Ver 1.00 (J)
* 2012.03.05 Spec Ver 1.01 (E)
* 2012.03.05 Spec Ver 1.01 (J)
* 2012.08.02 Appendix B (E)
* 2012.08.02 Appendix B (J)
* 2012.09.03 Spec Ver 1.00 (E)
* 2012.09.13 Appendix A (E)
* 2013.03.31 Spec Ver 1.10 (E)
* 2013.03.31 Spec Ver 1.10 (J)
* 2013.05.31 Appendix C (E)
* 2013.05.31 Appendix C (J)
* 2013.10.31 Appendix D (E)
* 2013.10.31 Appendix D (J)
* 2014.03.27 Appendix E (J)
* 2014.06.09 Spec Ver 1.11 (E)
* 2014.06.09 Spec Ver 1.11 (J)
* 2014.09.03 Appendix F (E)
* 2014.09.03 Appendix F (J)
* 2015.03.29 Appendix F (J) Errata
* 2015.05.29 Appendix A (J) Errata
* 2015.05.29 Appendix B (J) Errata
* 2015.05.29 Appendix C (J) Errata
* 2015.05.29 Appendix D (J) Errata
* 2015.05.29 Appendix E (E)
* 2015.05.29 Appendix E (J) Errata
* 2015.05.29 Appendix G (E)
* 2015.05.29 Appendix G (J)
* 2015.06.16 Appendix G (J) Revised
* 2015.09.30 Spec Ver 1.12 (J)
* 2016.03.27 Spec Ver 1.12 (E)
* 2016.05.27 Appendix H (E)
* 2016.05.27 Appendix H (J)
* 2016.08.24 Appendix H (J) Errata
* 2016.12.09 Appendix I (J)
* 2017.03.24 Spec Ver 1.12 (J) Errata



## Author

神奈川工科大学  創造工学部  ホームエレクトロニクス開発学科．

Dept. of Home Electronics, Faculty of Creative Engineering, Kanagawa Institute of Technology.


杉村　博

SUGIMURA, Hiroshi


### 辞書データ作成とご協力


ECHONET LiteのJSONデータベースは，神奈川工科大学スマートハウス研究センターの藤田裕之さんが作成したJSON dataを利用しました．

The program uses JSON database for ECHONET Lite objects generated by Kanagawa Institute of Technology, as following URL.
[https://github.com/KAIT-HEMS/ECHONET-APPENDIX](https://github.com/KAIT-HEMS/ECHONET-APPENDIX)


Ver. 0.05では，辞書「dictionary\_b.json」および「dictionary\_c.json」作成にあたり，下記の株式会社ソニーコンピュータサイエンス研究所のCSVファイルを利用いたしました．

For making dictionary_b.json and dictionary_c.json on Ver. 0.0.5, It was used, that database for ECHONET Lite objects generated by Sony Computer Science Laboratories, Inc as following URL.

SonyCSL/ECHONETLite-ObjectDatabase: Owada : Devices and properties database for ECHONET Lite home appliances, sensors, and so on.
[https://github.com/SonyCSL/ECHONETLite-ObjectDatabase](https://github.com/SonyCSL/ECHONETLite-ObjectDatabase)



## Log

- 1.9.1 Signed Integerの可変長ビット対応（16bit/32bit等の符号付き整数変換を修正）
- 1.9.0 APIエイリアス追加（EDTCombination, elsAnalysis）、ESV正規化対応（大文字小文字自動変換）、辞書アクセス安全化（optional chaining）、JSDoc完全対応、GitHub Actionsでドキュメント自動生成、テスト154件（+4件）
- 1.8.1 バグ修正、小数点対策
- 1.8.0 小数点対策
- 1.7.0 スマート電力量サブメータ、瞬時電力計測値
- 1.6.0 スマート電力量サブメータ、複雑なEPCの解釈を追加
- 1.5.5 スマート電力量サブメータ追加、もしかしたらEPC間違っているかもしれない
- 1.5.4 電気掃除機追加
- 1.5.3 低圧スマメ、時間をISO Stringにした
- 1.5.2 低圧スマメ、複雑なEPCの解釈を追加
- 1.5.1 いらないログ消した
- 1.5.0 低圧スマメに少し対応
- 1.4.0 初期化していなかったら自動的に初期化する
- 1.3.0 低圧スマメちょっと修正
- 1.2.0 低圧スマメちょっと修正
- 1.1.0 1Byte単位でスペースいれる。
- 1.0.3 分電盤メータリングのバグ改修。
- 1.0.2 分電盤メータリングBEのバグ改修。
- 1.0.1 分電盤メータリングに少し対応した。
- 1.0.0 ascii変換のときのNull文字削除に対応した。動作安定してきたのでVer1とする。
- 0.0.22 getはFixedよりRequestのほうがわかりよい。bug fix: SEOJとDEOJが逆転するときにelsAnarysisが解析失敗することがあった。識別番号はそのままで意味があるものとした。
- 0.0.21 let対応，unit test，Release対応
- 0.0.20 GETはEDT00固定なので，それに対応
- 0.0.19 refESVでESVがコンソールにでるバグを修正
- 0.0.18 elsの解析に対応
- 0.0.17 'use strict'対応，rawData:ShiftJIS対応（オーブンレンジの0xEAくらいしかないのだが）
- 0.0.16 README.md修正
- 0.0.15 Version情報に対応した．すごく古いバージョンにはうまく対応できていないかもしれない．
- 0.0.14 状変アナウンスプロパティマップ(9D), Setプロパティマップ(9E), Getプロパティマップ(9F)に対応した．
- 0.0.13 メーカコードに対応した．
- 0.0.12 設置場所の国土地理院場所情報コード方式は対応した．緯度経度高さ方式の16バイトの定義が不明なので誰か教えて．
- 0.0.11 設置場所の1バイト方式に対応した．緯度経度高さ方式と国土地理院場所情報コード方式はめんどくさい．
- 0.0.10 bitmap方式対応した．対応していないデータタイプはあと2種類（rawData:ShiftJIS，others）あるけどきびしい．よく考えるとRepeatCount対応していないかも．
- 0.0.9 customTypeタイプとrawData.ASCIIに対応した．対応していないデータタイプ（bitmap，rawData:ShiftJIS，others）をもう少しわかりやすく表現してみた．
- 0.0.8 levelタイプに対応した．ただし，クッキングヒータクラスの加熱出力設定には非対応．対応していないデータタイプ（bitmap，rawData，customType，others）をもう少しわかりやすく表現してみた．
- 0.0.7 辞書ファイルをVer 1.12のNode ProfileとRelease Iに対応した．内部的にはRelease Hも持っている．その関連で辞書の位置が変わった．EDTを少し解釈するようになった．解釈できないEDTはcontentTypeを付けることにした．EPCのF0からFFまでをユーザ定義領域と解釈結果を付けることにした．
- 0.0.6 辞書ファイルをVer 1.11eのNode ProfileとRelease Gに対応した．日本語版になった．英語版辞書も欲しい．
- 0.0.5 辞書ファイルをVer 1.11eのNode ProfileとRelease CのObject super classにかなり対応した．
- 0.0.4 攻略情報が，「ECHONET Lite 攻略情報」だったので「ECHONET Lite Converter 攻略情報」にした．READMEを適当に英語追加した．
- 0.0.3 辞書ファイルをRelease Cにかなり対応した．これからすべてのReleaseバージョンにどう対応するかが検討事項する．
- 0.0.2 README.mdをそこそこきれいにした．攻略情報と辞書ファイルのことも追記した．
- 0.0.1 枠組み公開した．


## トラブルシューティング / Troubleshooting

### よくある問題と解決方法 / Common Issues and Solutions

#### 1. `m_dictDev is not defined` エラー

**原因**: `initialize()`を呼ぶ前にAPIを使用している

**解決策**:
```javascript
const ELconv = require('echonet-lite-conv');
ELconv.initialize();  // 必ず最初に実行
// その後でAPIを使用
```

#### 2. ESVが認識されない

**原因**: 以前は大文字小文字を区別していました

**解決策**: v1.8以降は自動的に正規化されるため、`'62'`でも`'6E'`でも動作します

#### 3. EDTが解析されない

**原因**: 対応していないデータタイプまたはEOJ/EPCの組み合わせ

**解決策**: `parseEDT`の戻り値の`contentType`を確認してください
```javascript
const result = ELconv.parseEDT(eoj, epc, edt);
if (result.contentType === 'referSpec') {
    console.log('未対応のデータタイプです:', result);
}
```

#### 4. テストが失敗する（ローカル開発時）

**原因**: 辞書ファイルのパスが正しくない

**解決策**:
```bash
# プロジェクトルートから実行
npm test

# パスを確認
ls -la Spec_1.12/
```

### APIエイリアスについて / About API Aliases

以下の関数は名前が間違っていましたが、後方互換性のため両方使えます：

The following functions had incorrect names, but both are available for backward compatibility:

| 古い名前（非推奨） / Old (deprecated) | 新しい名前（推奨） / New (recommended) |
|-----------------------------------|-------------------------------------|
| `EDTconvination`                  | `EDTCombination`                    |
| `elsAnarysis`                     | `elsAnalysis`                       |

**推奨**: 新しいコードでは正しい名前（`EDTCombination`, `elsAnalysis`）を使用してください。

**Recommendation**: Use the correct names (`EDTCombination`, `elsAnalysis`) in new code.

## Known Issues（既知の問題）

* 本当はRelease versionをみて，対応したバージョンの辞書を参考にしないといけないが，いまは最新データベースしか見に行っていない．たとえば古いEL機器は製造番号8DがASCIIでなくて0が入っていたりする。
* levelタイプの，クッキングヒータクラスの加熱出力設定には非対応．
* 英語に対応してない（JSON DBの英語対応待ち）．
* 設置場所17バイト方式の，緯度経度高さ方式の16バイトの割り当てが不明．
* RepeatCount非対応
* データタイプothersはオブジェクト別対応のため，非対応

## Contributing / 貢献

プルリクエストやissueを歓迎します！

Pull requests and issues are welcome!

### 開発環境のセットアップ / Development Setup

```bash
git clone https://github.com/hiroshi-sugimura/echonet-lite-conv.js.git
cd echonet-lite-conv.js
npm install
npm test  # 154テストが通ることを確認
```

### テストの追加方法 / How to Add Tests

1. `unitTest/` フォルダに `*.spec.js` ファイルを作成
2. Mocha + Chai を使用してテストを記述
3. `npm test` で確認

詳細は [Unit Test セクション](#unit-test--単体テスト) を参照してください。

## License / ライセンス

MIT License

Copyright (c) Hiroshi Sugimura, Kanagawa Institute of Technology
