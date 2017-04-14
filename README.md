# Overview

このモジュールは**ECHONET Liteプロトコルのコンバーター**として機能します．
基本的に，[echonet-lite.js](https://www.npmjs.com/package/echonet-lite)とセットで利用することを想定しています．

This module provides **converter for ECHONET Lite protocol**.
The module to process ECHONET Lite protocol is [here](https://www.npmjs.com/package/echonet-lite).



## Install

    > npm install echonet-lite-conv


## Demos

* An example of a script

    // EL最小構成, minimum sample
    // ECHONET Liteのコンバーターを準備しておいて
    var ELconv = require('echonet-lite-conv');

    // コンバータを初期化しておく（JSON形式の定義データを読む）
    ELconv.initialize();

    // require('echonet-lite') で利用される EL.facilities の受信データがこんな感じで管理されるので
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

    // こんな感じでテキスト参照に変換できる
    ELconv.refer( facilities, function( devs ) {
    	console.dir(devs);
    });


* output

    { IPs:
        [ '192.168.2.104',
          '192.168.2.127',
          '192.168.2.148',
          '192.168.2.159',
          '192.168.2.115',
          '192.168.2.103' ],

        '192.168.2.104':
        { EOJs: [ 'Controller01', 'Node profile01' ],
        Controller01:
            { EPCs: [Object],
                'Operation status': '30',
                'Self-node instance list S': '' },
            'Node profile01': { EPCs: [Object], d6: '0105ff01' } },

        '192.168.2.127':
        { EOJs: [ 'Node profile01' ],
            'Node profile01': { EPCs: [Object], 'Operation status': '30', d6: '0105fe01' } },

        '192.168.2.148':
        { EOJs: [ 'Controller01' ],
        Controller01: { EPCs: [Object], 'Self-node instance list S': '' } },

        '192.168.2.159':
        { EOJs: [ 'General lighting class01', 'Node profile01' ],
            'General lighting class01': { EPCs: [Object], 'Operation status': '31', d5: '01029001' },
            'Node profile01': { EPCs: [Object], 'Operation status': '30' } },  // <------ 攻略情報

        '192.168.2.115':
        { EOJs: [ 'Air cleaner01' ],
            'Air cleaner01':
            { EPCs: [Object],
                'Operation status': '31',
            f2: '400000000000000000000000000000000000020000ff0000ffff3100',
                'Air pollution detection status': '42',
                '01': '' } },

        '192.168.2.103':
        { EOJs: [ 'Controller01' ],
        Controller01:
            { EPCs: [Object],
                'Operation status': '',
                'Self-node instance list S': '' } } }



## Stracture of result data

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


## API


* コンバータを初期化しておく（JSON形式の定義データを読む）

    ELconv.initialize();


* こんな感じでテキスト参照に変換できる


    ELconv.refer( facilities, function( devs ) {
    	console.dir(devs);
    });



## ECHONET Lite Converter 攻略情報

Demosを見ればだいたいわかると思う．EDTにアクセスするには例えば，

For using this module, data accesing sample is following.

    ip  = devs.IPs[3];                // '192.168.2.159'
    eoj = devs[ip].EOJs[1];           // 'Node profile01'
    epc = devs[ip][eoj].EPCs[0];      // 'Operation status'
    edt = devs[ip][eoj][epc];         // '30'
    console.log( edt );



## Memo

下記ファイルが辞書になっている．

Following file is dictionary for ECHONET Lite in JSON format.

    ./node_modules/echonet-lite-conv/Appendix_G/deviceObject_G.json
    ./node_modules/echonet-lite-conv/Appendix_G/superClass_G.json
    ./node_modules/echonet-lite-conv/Appendix_H/deviceObject_H.json
    ./node_modules/echonet-lite-conv/Appendix_H/superClass_H.json
    ./node_modules/echonet-lite-conv/Appendix_I/deviceObject_I.json
    ./node_modules/echonet-lite-conv/Appendix_I/superClass_I.json
    ./node_modules/echonet-lite-conv/Spec_1.11/nodeProfile.json
    ./node_modules/echonet-lite-conv/Spec_1.12/nodeProfile.json


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


Ver. 0.06の辞書「deviceObject_G.json」，「nodeProfile.json」，「superClass.json」は，神奈川工科大学スマートハウス研究センターの
藤田裕之さんが作成した，ECHONET 機器オブジェクト詳細規定　Release G のJSON dataを利用しました。

For making deviceObject_G.json, nodeProfile.json, and superClass.json on Ver. 0.0.6, I used database for ECHONET Lite objects generated by Kanagawa Institute of Technology, as following URL.
[https://github.com/KAIT-HEMS/ECHONET-APPENDIX](https://github.com/KAIT-HEMS/ECHONET-APPENDIX)



Ver. 0.05の辞書「dictionary\_b.json」および「dictionary\_c.json」作成にあたり，下記の株式会社ソニーコンピュータサイエンス研究所のCSVファイルを利用いたしました．

For making dictionary_b.json and dictionary_c.json on Ver. 0.0.5, It was used, that database for ECHONET Lite objects generated by Sony Computer Science Laboratories, Inc as following URL.

SonyCSL/ECHONETLite-ObjectDatabase: Owada : Devices and properties database for ECHONET Lite home appliances, sensors, and so on.
[https://github.com/SonyCSL/ECHONETLite-ObjectDatabase](https://github.com/SonyCSL/ECHONETLite-ObjectDatabase)



## Log

0.0.7 辞書ファイルをVer 1.12のNode ProfileとRelease Iに対応した．内部的にはRelease Hも持っている．その関連で辞書の位置が変わった．EDTを少し解釈するようになった．解釈できないEDTはcontentTypeを付けることにした．EPCのF0からFFまでをユーザ定義領域と解釈結果を付けることにした．

0.0.6 辞書ファイルをVer 1.11eのNode ProfileとRelease Gに対応した．日本語版になった．英語版辞書も欲しい．

0.0.5 辞書ファイルをVer 1.11eのNode ProfileとRelease CのObject super classにかなり対応した．

0.0.4 攻略情報が，「ECHONET Lite 攻略情報」だったので「ECHONET Lite Converter 攻略情報」にした．READMEを適当に英語追加した．

0.0.3 辞書ファイルをRelease Cにかなり対応した．これからすべてのReleaseバージョンにどう対応するかが検討事項する．

0.0.2 README.mdをそこそこきれいにした．攻略情報と辞書ファイルのことも追記した．

0.0.1 枠組み公開した．

