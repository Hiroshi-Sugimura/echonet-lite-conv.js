# Overview，概要

このモジュールは**ECHONET Liteプロトコルのコンバーター**として機能します．
基本的に，[echonet-lite.js](https://www.npmjs.com/package/echonet-lite)とセットで利用することを想定していますが単体でも利用できます．

This module provides **converter for ECHONET Lite protocol**.
The module to process ECHONET Lite protocol is [here](https://www.npmjs.com/package/echonet-lite).



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


* First, you must initialize this converter.
コンバータを初期化しておく（JSON形式の定義データを読む）

```
ELconv.initialize();
```


* You can use this converter as following.
こんな感じでテキスト参照に変換できる

```
ELconv.refer( facilities, function( devs ) {
	console.dir(devs);
});
```



## ECHONET Lite Converter 攻略情報

Demosを見ればだいたいわかると思う．EDTにアクセスするには例えば，

For using this module, data accesing sample is following.

```
ip  = devs.IPs[3];                // '192.168.2.159'
eoj = devs[ip].EOJs[1];           // 'Node profile01'
epc = devs[ip][eoj].EPCs[0];      // 'Operation status'
edt = devs[ip][eoj][epc];         // '30'
console.log( edt );
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


## Known Issues（既知の問題）

* 本当はRelease versionをみて，対応したバージョンの辞書を参考にしないといけないが，いまは最新データベースしか見に行っていない．たとえば古いEL機器は製造番号8DがASCIIでなくて0が入っていたりする。
* levelタイプの，クッキングヒータクラスの加熱出力設定には非対応．
* 英語に対応してない（JSON DBの英語対応待ち）．
* 設置場所17バイト方式の，緯度経度高さ方式の16バイトの割り当てが不明．
* RepeatCount非対応
* データタイプothersはオブジェクト別対応のため，非対応
