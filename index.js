//////////////////////////////////////////////////////////////////////
//	$Date:: 2016-04-03 17:56:33 +0900#$
//	$Rev: 9416 $
//	Copyright (C) Hiroshi SUGIMURA 2016.04.03.
//////////////////////////////////////////////////////////////////////
'use strict'

//////////////////////////////////////////////////////////////////////
const Encoding = require('encoding-japanese');
const fs = require('fs');

// クラス変数
let ELconv = {
  m_dict: {},
  m_latestSpec: '1.12',
  m_latestAppendix:'I',
  m_initialized: false
};


// 辞書の読み込み
ELconv.initialize = function () {
	// 本来はすべての辞書をもって，条件分けすべき
	// ELconv.m_dictNod = JSON.parse( fs.readFileSync('./node_modules/echonet-lite-conv/Spec_1.11/nodeProfile.json', 'utf8') );
	ELconv.m_dictNod = JSON.parse( fs.readFileSync('./node_modules/echonet-lite-conv/Spec_1.12/nodeProfile.json', 'utf8') );

	// ELconv.m_dictSup = JSON.parse( fs.readFileSync('./node_modules/echonet-lite-conv/Appendix_G/superClass_G.json', 'utf8') );
	// ELconv.m_dictSup = JSON.parse( fs.readFileSync('./node_modules/echonet-lite-conv/Appendix_H/superClass_H.json', 'utf8') );
	ELconv.m_dictSup = JSON.parse( fs.readFileSync('./node_modules/echonet-lite-conv/Appendix_I/superClass_I.json', 'utf8') );

	// ELconv.m_dictDev = JSON.parse( fs.readFileSync('./node_modules/echonet-lite-conv/Appendix_G/deviceObject_G.json', 'utf8') );
	// ELconv.m_dictDev = JSON.parse( fs.readFileSync('./node_modules/echonet-lite-conv/Appendix_H/deviceObject_H.json', 'utf8') );
	ELconv.m_dictDev = JSON.parse( fs.readFileSync('./node_modules/echonet-lite-conv/Appendix_I/deviceObject_I.json', 'utf8') );

	// メーカーコード辞書
	ELconv.m_dictMakers = JSON.parse( fs.readFileSync('./node_modules/echonet-lite-conv/makers.json', 'utf8') );
};


//////////////////////////////////////////////////////////////////////
// 変換系/内部関数
//////////////////////////////////////////////////////////////////////

// 1バイトを文字列の16進表現へ（1Byteは必ず2文字にする）
ELconv.toHexString = function( byte ) {
	// 文字列0をつなげて，後ろから2文字分スライスする
	return ( ('0' + byte.toString(16)).slice(-2) );
};


// 2進表現の文字列を数値のバイト配列へ
ELconv.toHexArray = function( string ) {
	let ret = [];
	let i, l, r;

	for( i=0; i < string.length; i += 2 ) {
		l = string.substr( i, 1 );
		r = string.substr( i+1, 1 );
		ret.push( (parseInt(l, 16) * 16) + parseInt(r, 16) );
	}

	return ret;
};

// contentType = customType
ELconv.YYMtoString = function( yym ) {  // Year(2byte), Month(1byte)
	let yy, m;
	yy = yym.substr( 0, 4 );
	m  = yym.substr( 4, 2 );
	return parseInt( yy, 16 ) + '.' + parseInt( m, 16);
};

ELconv.YYMDtoString = function( yymd ) { // Year(2byte), Month(1byte), Day(1byte)
	let yy, m, d;
	yy = yymd.substr( 0, 4 );
	m  = yymd.substr( 4, 2 );
	d  = yymd.substr( 6, 2 );
	return parseInt( yy, 16 ) + '.' + parseInt( m, 16) + '.' + parseInt( d, 16);
};

ELconv.HMtoString = function( hm ) {  // Hour(1byte), Minute(1byte)
	let h, m;
	h = hm.substr( 0, 2 );
	m = hm.substr( 2, 2 );
	return parseInt( h, 16 ) + '.' + parseInt( m, 16);
};

ELconv.HMStoString = function( hms ) { // Hour(1byte), Minute(1byte), Second(1byte)
	let h, m, s;
	h = hms.substr( 0, 2 );
	m = hms.substr( 2, 2 );
	s = hms.substr( 4, 2 );
	return parseInt( h, 16 ) + '.' + parseInt( m, 16) + '.' + parseInt( s, 16);
};

ELconv.HMFtoString = function( hmf ) { // Hour(1byte), Minute(1byte), Frame(1byte)
	let h, m, f;
	h = hmf.substr( 0, 2 );
	m = hmf.substr( 2, 2 );
	f = hmf.substr( 4, 2 );
	return parseInt( h, 16 ) + '.' + parseInt( m, 16) + '.' + parseInt( f, 16);
};

ELconv.MStoString = function( ms ) {  // Minute(1byte), Second(1byte)
	let m, s;
	m = ms.substr( 0, 2 );
	s = ms.substr( 2, 2 );
	return parseInt( m, 16 ) + '.' + parseInt( s, 16);
};

// rawData
ELconv.HEXStringtoShiftJIS = function( hexString ) {
	let array = ELconv.toHexArray( hexString );
	return ( Encoding.codeToString(Encoding.convert(array)) );
};

ELconv.HEXStringtoASCII = function( hexString ) {
	let array = ELconv.toHexArray( hexString );
	let ret = Buffer(array).toString('ASCII');
	return ret.replace(/\0/g, ''); // null(\0000)が入ってしまうことがあるので
};


ELconv.BITMAPtoString = function( edt, typeArray ) {
	let ret = '';
	let x = parseInt( edt );

	for( let i = 0; i < typeArray.length; i += 1 ) {
		ret += typeArray[i].bitName + ':' + typeArray[i].bitValues[(x >> i) & 1] + ',';
	}
	ret = ret.slice(0, -1);

	return ret;
};


// Byte列文字列を2文字づつスペース区切り
ELconv.ByteStringSeparater = function( bytestring ) {
	if( bytestring == null ) {
		return '';
	}

	let ret = '';
	for( let i = 0; i < bytestring.length; i += 2 ) {
		ret += bytestring.substr(i, 2) + ' ';
	}
	ret = ret.slice(0, -1);

	return ret;
};


// EOJを文字列へ
ELconv.refEOJ = function(eoj) {
	let ret = eoj = eoj.toUpperCase();
	if( eoj.substr(0,4) == '0EF0' ) {
		ret = ELconv.m_dictNod.elObjects['0x0EF0'].objectName + eoj.substr(4,2);
	}
	if( ELconv.m_dictDev.elObjects['0x'+eoj.substr(0,4)] ) {
		ret = ELconv.m_dictDev.elObjects['0x'+eoj.substr(0,4)].objectName + eoj.substr(4,2);
	}
	return ret;
};


// EPCを文字列へ
ELconv.refEPC = function(eoj, epc) {
	eoj = eoj.toUpperCase();
	let ret = epc = epc.toUpperCase();

	// F0からFFまではuser defined
	let upper = epc.substr( 0, 1 );
	if( upper == 'F' ) {
		ret = 'ユーザ定義領域(' + epc + ')';
	}

	// スーパークラスにあるか？
	if( undefined != ELconv.m_dictSup.elObjects['0x0000'].epcs['0x'+epc] ) { // 指定のEPCはあるか？あればまず確保，機器固有があれば上書き
		ret = ELconv.m_dictSup.elObjects['0x0000'].epcs['0x'+epc].epcName  + '(' + epc + ')';
	}

	if( eoj.substr(0, 4) == '0EF0' ) {  // node profile object
		let devProps = ELconv.m_dictNod.elObjects['0x'+eoj.substr(0, 4)];
		if( '0x'+epc in devProps.epcs ) { // 指定のEPCはあるか？
			ret = devProps.epcs['0x'+epc].epcName  + '(' + epc + ')';
		}
	}

	// 各機器固有のEPCか？
	if( ELconv.m_dictDev.elObjects['0x'+eoj.substr(0, 4)] ) {  // 指定のEOJはあるか？
		let devProps = ELconv.m_dictDev.elObjects['0x'+eoj.substr(0, 4)];
		if( '0x'+epc in devProps.epcs ) { // 指定のEPCはあるか？
			ret = devProps.epcs['0x'+epc].epcName  + '(' + epc + ')';
		}
	}
	return (ret);
};


//////////////////////////////////////////////////////////////////////
// other(referSpec)
//////////////////////////////////////////////////////////////////////

// referSpecをEOJとEPCで振り分け
ELconv.selectReferSpec = function( eoj, epc, edt ) {
	let ret;
	eoj = eoj.toUpperCase();
	epc = epc.toUpperCase();
	edt = edt.toUpperCase();

	if( epc == '81' ) { // 設置場所
		ret = ELconv.referSpec81( eoj, epc, edt);
	} else if( epc == '82' ) { // Version情報
		ret = ELconv.referSpec82( eoj, epc, edt);
	} else if( epc == '83' ) { // 識別番号
		ret = ELconv.ByteStringSeparater(edt);
	}else if( epc == '8A' ) { // メーカコード
		ret = ELconv.referSpec8A( eoj, epc, edt);
	} else if( epc == '9D' || epc == '9E' || epc == '9F' ) {
		ret = ELconv.referSpec9D9E9F( eoj, epc, edt);
	} else {
		ret = 'referSpec' + '(' + ELconv.ByteStringSeparater(edt) + ')';
	}

	return ret;
};


//------------------
// 設置場所
ELconv.referSpec81 = function(eoj, epc, edt) {
	let ret;
	eoj = eoj.toUpperCase();
	epc = epc.toUpperCase();
	edt = edt.toUpperCase();
	let edtHexArray = ELconv.toHexArray( edt );
	// 設置場所コード0x01の時は，以降に続く16バイトで緯度・経度・高さの情報とする
	// 設置場所コード0x01の時で，上位8バイトが 00,00,1B,00,00,00,00,03の時には下位8バイトは国土地理院の場所情報コードに従う
	// 設置場所コード0x02から0x07はfor future reserved

	if( edtHexArray[0] == 0 ) {
		ret = '位置情報未設定' + '(' + ELconv.ByteStringSeparater(edt) + ')';

	}else if( edtHexArray[0] == 1 ) {
		// 緯度・経度・高さ or 国土地理院
		ret = '位置情報定義';

		if( edt.substr( 2, 16) == '00001B0000000003' ) {
			ret += ':国土地理院場所情報コード:';

			let latitude = ((edtHexArray[9]& 0x3f)<<17) + ((edtHexArray[10] & 0xff)<<9) + ((edtHexArray[11]& 0xff)<<1) + ((edtHexArray[12] & 0x80)>>7);
			let longitude =  ((edtHexArray[12]& 0x7f)<<17) + ((edtHexArray[13] & 0xff)<<9) + ((edtHexArray[14]& 0xff)<<1) + ((edtHexArray[15] & 0x80)>>7);
			let floor = ((edtHexArray[15]& 0x7f)<<1) + ((edtHexArray[16]& 0x80)>>7) - 50;
			let floor_mid = ((edtHexArray[16]& 0x40)>>6);
			let number = (edtHexArray[16]& 0x3f);

			ret += 'latitude=' + latitude + ',longitude=' + longitude + ',floor=' + floor;
			if( floor_mid = 1 ) {
				ret += '+mid';
			}
			ret += ',number=' + number;

		}else{
			ret += ':緯度・経度・高さ:';
		}

		ret += '(' + ELconv.ByteStringSeparater(edt) + ')';
	}else if( 2 < edtHexArray[0] && edtHexArray[0] < 7 ) {
		ret = 'for future reserved' + '(' + ELconv.ByteStringSeparater(edt) + ')';

	}else if( edtHexArray[0] == 255 ) {
		ret = '設置場所不定' + '(' + ELconv.ByteStringSeparater(edt) + ')';

	}else{
		// 1バイトの時は表を見る
		let x = parseInt( edt, 16 );

		if( x & 0x80 ) {
			ret = 'フリー定義' + (x & 0x7f) + '(' + ELconv.ByteStringSeparater(edt) + ')';

		}else{
			let highNumber = ( (x>>3) & 0x0F );
			let lowNumber = (x & 0x07);

			switch( highNumber ) {
			  case 1:
				ret = '居間、リビング' + lowNumber + '(' + ELconv.ByteStringSeparater(edt) + ')';

				break;
			  case 2:
				ret = '食堂、ダイニング' + lowNumber + '(' + ELconv.ByteStringSeparater(edt) + ')';
				break;
			  case 3:
				ret = '台所、キッチン' + lowNumber + '(' + ELconv.ByteStringSeparater(edt) + ')';
				break;
			  case 4:
				ret = '浴槽、バス' + lowNumber + '(' + ELconv.ByteStringSeparater(edt) + ')';
				break;
			  case 5:
				ret = 'トイレ' + lowNumber + '(' + ELconv.ByteStringSeparater(edt) + ')';
				break;
			  case 6:
				ret = '洗面所、脱衣所' + lowNumber + '(' + ELconv.ByteStringSeparater(edt) + ')';
				break;
			  case 7:
				ret = '廊下' + lowNumber + '(' + ELconv.ByteStringSeparater(edt) + ')';
				break;
			  case 8:
				ret = '部屋' + lowNumber + '(' + ELconv.ByteStringSeparater(edt) + ')';
				break;
			  case 9:
				ret = '階段' + lowNumber + '(' + ELconv.ByteStringSeparater(edt) + ')';
				break;
			  case 10:
				ret = '玄関' + lowNumber + '(' + ELconv.ByteStringSeparater(edt) + ')';
				break;
			  case 11:
				ret = '納屋' + lowNumber + '(' + ELconv.ByteStringSeparater(edt) + ')';
				break;
			  case 12:
				ret = '庭、外周' + lowNumber + '(' + ELconv.ByteStringSeparater(edt) + ')';
				break;
			  case 13:
				ret = '車庫' + lowNumber + '(' + ELconv.ByteStringSeparater(edt) + ')';
				break;
			  case 14:
				ret = 'ベランダ、バルコニー' + lowNumber + '(' + ELconv.ByteStringSeparater(edt) + ')';
				break;
			  case 15:
				ret = 'その他' + lowNumber + '(' + ELconv.ByteStringSeparater(edt) + ')';
				break;
			  default:
				ret = 'referSpec' + '(' + ELconv.ByteStringSeparater(edt) + ')';
				break;
			}
		}
	}

	return (ret);
};

//------------------
// Version情報
ELconv.referSpec82 = function ( eoj, epc, edt) {
	let ret = '';
	eoj = eoj.toUpperCase();
	epc = epc.toUpperCase();
	edt = edt.toUpperCase();
	let edtHexArray = ELconv.toHexArray( edt );

	if( eoj.substr( 0, 4 ) == '0EF0' ) { // プロファイルオブジェクト方式
		ret = 'Ver. ';
		ret += edtHexArray[0] + '.' + edtHexArray[1];

		switch( edtHexArray[2] ) {
		  case 1:
			ret += ' 規定電文形式';
			break;
		  case 2:
			ret += ' 任意電文形式';
			break;
		  case 3:
			ret += ' 規定・任意電文形式';
			break;
		}

	} else { // 機器オブジェクト
		ret = 'Release ';
		ret += Buffer( [edtHexArray[2]] ).toString('ASCII');
	}

	ret += '(' + ELconv.ByteStringSeparater(edt) + ')';

	return ret;
};


//------------------
// メーカコード
ELconv.referSpec8A = function(eoj, epc, edt) {
	edt = edt.toUpperCase();

	let ret = 'Makercode is not found.';

	if( ELconv.m_dictMakers[edt] ) {
		ret = ELconv.m_dictMakers[edt];
	}
	ret += '(' + ELconv.ByteStringSeparater(edt) + ')';

	return ret;
};


//------------------
// プロパティマップ 9D, 9E, 9Fを解析する。下記のフォーム2とセットで
ELconv.referSpec9D9E9F = function(eoj, epc, edt) {
	let ret = '';
	let array = ELconv.toHexArray( edt );

	if( array.length < 16 ) { // プロパティマップ16バイト未満は記述形式１
		array = array.map( function(e) {
			return ELconv.toHexString(e);
		});
		ret = array[0];
		ret += '[' + array.slice(1).join(', ') + ']';
	} else {
		// 16バイト以上なので記述形式2，EPCのarrayを作り直したら，あと同じ
		array = ELconv.parseMapForm2( array );
		array = array.map( function(e) {
			return ELconv.toHexString(e);
		});
		ret = array[0];
		ret += '[' + array.slice(1).join(', ') + ']';
	}
	ret += '(' + ELconv.ByteStringSeparater(edt) + ')';
	return ret;
};

// parse Propaty Map Form 2
// 16以上のプロパティ数の時，記述形式2，出力はForm1にすること
ELconv.parseMapForm2 = function( array ) {
	let ret = [];
	let val = 0x80;

	// bit loop
	for( let bit=0; bit<8; bit += 1 ) {
		// byte loop
		for( let byt=1; byt<17; byt+=1 ) {
			if( (array[byt] >> bit) & 0x01 ) {
				ret.push(val);
			}
			val += 1;
		}
	}

	ret.unshift( ret.length );

	return ret;
};


//////////////////////////////////////////////////////////////////////
// 分電盤メータリング 0287
//////////////////////////////////////////////////////////////////////
ELconv.distributionBoardC2 = function ( eoj, epc, edt) {
	let ret = 0.001; // default, 0.001kWh
	switch(edt) {
	  case '00':
		ret = 1;
		break;
	  case '01':
		ret = 0.1;
		break;
	  case '02':
		ret = 0.01;
		break;
	  case '03':
		ret = 0.001;
		break;
	  case '04':
		ret = 0.0001;
		break;
	  case '0A':
		ret = 10;
		break;
	  case '0B':
		ret = 100;
		break;
	  case '0C':
		ret = 1000;
		break;
	  case '0D':
		ret = 10000;
		break;
	}
	return ret;
};


// 積算電力量計測チャンネル範囲指定（片方向） B2
// 瞬時電流計測チャンネル範囲指定（片方向） B4
// 瞬時電力計測チャンネル範囲指定（片方向） B6
// 積算電力量計測チャンネル範囲指定（双方向） B9
// 瞬時電流計測チャンネル範囲指定（双方向） BB
// 瞬時電力計測チャンネル範囲指定（双方向） BD
ELconv.distributionBoardB2B4B6B9BBBD = function ( eoj, epc, edt) {
	return edt.substr(0,2) + 'ch-' + edt.substr(2,4) + 'ch' + '(' + ELconv.ByteStringSeparater(edt) + ')';
};

// 積算電力量計測値リスト（片方向） B3 単位がC2に依存する
ELconv.distributionBoardB3 = function ( eoj, epc, edt) {
	let edtHexArray = ELconv.toHexArray( edt );
	let begin = edtHexArray[0];
	let end = edtHexArray[1];
	let ret = {};

	for(let i=begin; i<=end; i+=1) {
		let value = edtHexArray[i*2]*256 + edtHexArray[i*2+1];
		ret['ch'+i] = value + '[xC2 kWh]';  // デフォルトでWhだが，本質的にはC2に依存する
	}

	return JSON.stringify(ret) + '(' + ELconv.ByteStringSeparater(edt) +')';
};

// 瞬時電流計測値リスト（片方向） B5 0.1A
ELconv.distributionBoardB5 = function ( eoj, epc, edt) {
	let edtHexArray = ELconv.toHexArray( edt );
	let begin = edtHexArray[0];
	let end = edtHexArray[1];
	let ret = {};

	for(let i=begin; i<=end; i+=1) {
		let value = (edtHexArray[i*2]*256 + edtHexArray[i*2+1]) *0.1;
		ret['ch'+i] = value + '[A]';
	}

	return JSON.stringify(ret) + '(' + ELconv.ByteStringSeparater(edt) +')';
};

// 瞬時電力計測値リスト（片方向） B7 1W
ELconv.distributionBoardB7 = function ( eoj, epc, edt) {
	let edtHexArray = ELconv.toHexArray( edt );
	let begin = edtHexArray[0];
	let end = edtHexArray[1];
	let ret = {};

	for(let i=begin; i<=end; i+=1) {
		let value = edtHexArray[i*2]*256 + edtHexArray[i*2+1];
		ret[ 'ch'+i ] = value + '[W]';
	}

	return JSON.stringify(ret) + '(' + ELconv.ByteStringSeparater(edt) +')';
};

// 積算電力量計測値リスト（双方向） BA Wh 単位はC2に従う
ELconv.distributionBoardBA = function ( eoj, epc, edt) {
	let edtHexArray = ELconv.toHexArray( edt );
	let begin = edtHexArray[0];
	let end = edtHexArray[1];
	let ret = {};

	for(let i=begin; i<=end; i+=1) {
		let value_f = edtHexArray[i*2]*256 + edtHexArray[i*2+1];
		let value_r = edtHexArray[i*2+2]*256 + edtHexArray[i*2+3];
		ret['ch'+i+'f'] = value_f + '[xC2 kWh]';
		ret['ch'+i+'r'] = value_r + '[xC2 kWh]';
	}

	return JSON.stringify(ret) + '(' + ELconv.ByteStringSeparater(edt) +')';
};

// 瞬時電流計測値リスト（双方向） BC 0.1A
ELconv.distributionBoardBC = function ( eoj, epc, edt) {
	let edtHexArray = ELconv.toHexArray( edt );
	let begin = edtHexArray[0];
	let end = edtHexArray[1];
	let ret = {};

	for(let i=begin; i<=end; i+=1) {
		let value_r = (edtHexArray[i*2]*256 + edtHexArray[i*2+1]) * 0.1;
		let value_t = (edtHexArray[i*2+2]*256 + edtHexArray[i*2+3]) *0.1;
		ret['ch'+i+'R'] = value_r + '[A]';
		ret['ch'+i+'T'] = value_t + '[A]';
	}

	return JSON.stringify(ret) + '(' + ELconv.ByteStringSeparater(edt) +')';
};

// 瞬時電力計測値リスト（双方向） BE W
ELconv.distributionBoardBE = function ( eoj, epc, edt) {
	let edtHexArray = ELconv.toHexArray( edt );
	let begin = edtHexArray[0];
	let end = edtHexArray[1];
	let ret = {};

	for(let i=begin; i<=end; i+=1) {
		let value = edtHexArray[i*2]*256 + edtHexArray[i*2+1];
		ret['ch'+i] = value + '[W]';
	}

	return JSON.stringify(ret) + '(' + ELconv.ByteStringSeparater(edt) +')';
};


// 低圧スマート電力メータ
// 瞬時電流計測値 E8
ELconv.lowVoltageSmartElectricEnergyMeterE8 = function (eoj, epc, edt) {
	let rPhase = edt.substr(0,4);
	let tPhase = edt.substr(4,4);
	let ret = {};

	ret['RPhase'] = Int16Array.from([parseInt(rPhase,16)])[0] * 0.1 + '[A]';

	if( tPhase === '7FFE' ) {
		ret['TPhase'] = 'two-wire';
	}else{
		ret['TPhase'] = Int16Array.from([parseInt(tPhase, 16)])[0] * 0.1 + '[A]';
	}

	return JSON.stringify(ret) + '(' + ELconv.ByteStringSeparater(edt) +')';
};


//////////////////////////////////////////////////////////////////////
// 変換系
//////////////////////////////////////////////////////////////////////

// ネットワーク内のEL機器全体情報を更新する
ELconv.refer = function( facilities, callback ) {
	let ret = {'IPs':[]};

	Object.keys( facilities ).forEach( function (ip) { // ip
		ret.IPs.push(ip);
		ret[ip] = {'EOJs': []}
		Object.keys( facilities[ip] ).forEach( function (eoj) { // eoj
			let retEoj = ELconv.refEOJ(eoj) + '(' + eoj + ')';
			ret[ip].EOJs.push( retEoj );
			ret[ip][retEoj] = { 'EPCs': [] };
			Object.keys( facilities[ip][eoj] ).forEach( function (epc) { // epc
				let retEpc = ELconv.refEPC(eoj, epc);
				ret[ip][retEoj].EPCs.push(retEpc);
				ret[ip][retEoj][retEpc] = ELconv.parseEDT( eoj, epc, facilities[ip][eoj][epc] ); //edt
			});
		}); // eoj
	}); // ip
	callback( ret );
};


//////////////////////////////////////////////////////////////////////
// parse EDT
// obj = facilities[ip][ eoj ][epc]
// epc = facilities[ip][eoj][ epc ]
// edt = facilities[ip][eoj][epc]
ELconv.parseEDT = function( eoj, epc, edt ) {
	eoj = eoj.toUpperCase();
	epc = epc.toUpperCase();
	edt = edt.toUpperCase();

	let contentRule;
	let ret;

	// F0からFFまではuser defined
	let upper = epc.substr( 0, 1 );
	if( upper == 'F' ) {
		ret = 'ユーザ定義領域(' + ELconv.ByteStringSeparater(edt) + ')';
		return ret;
	}

	// スーパークラスにあるか？
	if( undefined != ELconv.m_dictSup.elObjects['0x0000'].epcs['0x'+epc] ) { // 指定のEPCはあるか？あればまず確保，機器固有があれば上書き
		contentRule = ELconv.m_dictSup.elObjects['0x0000'].epcs['0x'+epc].edt[0].content;
	}

	if( eoj.substr(0, 4) == '0EF0' ) {  // node profile object
		let devProps = ELconv.m_dictNod.elObjects['0x'+eoj.substr(0, 4)];
		if( '0x'+epc in devProps.epcs ) { // 指定のEPCはあるか？
			contentRule = ELconv.m_dictNod.elObjects['0x'+eoj.substr(0, 4)].epcs['0x'+epc].edt[0].content;
		}
	}

	// 各機器固有のEPCか？
	if( ELconv.m_dictDev.elObjects['0x'+eoj.substr(0, 4)] ) {  // 指定のEOJはあるか？
		let devProps = ELconv.m_dictDev.elObjects['0x'+eoj.substr(0, 4)];
		if( '0x'+epc in devProps.epcs ) { // 指定のEPCはあるか？
			contentRule = ELconv.m_dictDev.elObjects['0x'+eoj.substr(0, 4)].epcs['0x'+epc].edt[0].content;
		}
	}

	// 1.content typeをみてみる
	for (let contentType in contentRule) {
		switch (contentType){
		  case 'rawData':				// rawData
			switch (contentRule.rawData) {
			  case 'ASCII':
				ret = ELconv.HEXStringtoASCII(edt) + '(ascii:' + ELconv.ByteStringSeparater(edt) + ')';
				break;
			  case 'ShiftJIS':
				ret = ELconv.HEXStringtoShiftJIS(edt) + '(ShiftJIS:' + ELconv.ByteStringSeparater(edt) + ')';
				break;
			  case 'binary':
			  default:
				ret = contentRule.rawData + '(' + ELconv.ByteStringSeparater(edt) + ')';
				break;
			}
			break;

		  case 'numericValue':			// numericValue
			let val = 0;
			switch (contentRule.numericValue.integerType) {
			  case 'Signed':
				val = parseInt( edt, 16);  // signedにしたい
				if (val > 127) { val = val - 256 }
				break;
			  case 'Unsigned':
				val = parseInt( edt, 16);
				break;
			  default:
				// エラー返すのどうしたらいいかわからん。
				val = parseInt( edt, 16);
				break;
			}

			let mag = 0; // 倍率を10のN乗表記した指数部。省略可。例: -1(x0.1), 2(x100)
			if( contentRule.numericValue.magnification ) {
				mag = parseInt(contentRule.numericValue.magnification);
			}

			let unit = ''; //  単位。省略可。例: '℃'
			if( contentRule.numericValue.unit ) {
				unit = contentRule.numericValue.unit;
			}

			ret = val * Math.pow(10, mag) + unit + '(' + ELconv.ByteStringSeparater(edt) + ')';
			break;

		  case 'level': // Rel.I, クッキングヒータクラスの加熱出力設定には非対応
			let value = parseInt( edt, 16);
			let min = parseInt( contentRule.level.min, 10);
			value -= min + 1;
			ret = 'level ' + value + '(' + ELconv.ByteStringSeparater(edt) + ')';
			break;

		  case 'customType':  // 時間
			switch( contentRule.customType ) {
			  case 'YYM':  // Year(2byte), Month(1byte)
				ret = ELconv.MStoString( edt ) + '(' + ELconv.ByteStringSeparater(edt) + ')';
				break;
			  case 'YYMD': // Year(2byte), Month(1byte), Day(1byte)
				ret = ELconv.YYMDtoString( edt ) + '(' + ELconv.ByteStringSeparater(edt) + ')';
				break;
			  case 'HM':   // Hour(1byte), Minute(1byte)
				ret = ELconv.HMtoString( edt ) + '(' + ELconv.ByteStringSeparater(edt) + ')';
				break;
			  case 'HMS':  // Hour(1byte), Minute(1byte), Second(1byte)
				ret = ELconv.HMStoString( edt ) + '(' + ELconv.ByteStringSeparater(edt) + ')';
				break;
			  case 'HMF':  // Hour(1byte), Minute(1byte), Frame(1byte)
				ret = ELconv.HMFtoString( edt ) + '(' + ELconv.ByteStringSeparater(edt) + ')';
				break;
			  case 'MS':   // Minute(1byte), Second(1byte)
				ret = ELconv.MStoString( edt ) + '(' + ELconv.ByteStringSeparater(edt) + ')';
				break;
			}
			break;

		  case 'bitmap': // bitmap方式
			ret = ELconv.BITMAPtoString( edt, contentRule.bitmap ) + '(' + ELconv.ByteStringSeparater(edt) + ')';
			break;

		  case 'others': // 各EPC個別対応しかできないかも？
			if( contentRule.others == 'referSpec' ) {
				ret = ELconv.selectReferSpec( eoj, epc, edt);
			} else {
				ret = contentRule.others + '(' + ELconv.ByteStringSeparater(edt) + ')';
			}
			break;

		  default:
			ret = contentType + '(' + ELconv.ByteStringSeparater(edt) + ')';
			break;
		}
	}

	// 2.keyValuesを持つときはそちらを優先するが，undefinedの時は値を更新しない
	for (let contentType in contentRule) {
		if( contentType == 'keyValues' ) {

			if( epc=='D6' ) {			// 3.keyValuesの特殊な形として，自ノードインスタンスリストSを解決する
				let count = parseInt( edt.substring( 0, 2) );
				ret = '';
				for( let i = 0; i<count; i++ ) {
					let st = edt.substr( i*6+2, 6);
					ret += ELconv.refEOJ(st) + ',';
				}
				ret = ret.slice(0, -1) + '(' + ELconv.ByteStringSeparater(edt) + ')';
			}
			else if( epc=='D7' ) { // 3.keyValuesの特殊な形として，自ノードクラスリストSを解決する
				let count = parseInt( edt.substring( 0, 2) );
				ret = '';
				for( let i = 0; i<count; i++ ) {
					let st = edt.substr( i*4+2, 4 );
					ret += ELconv.refEOJ(st) + ',';
				}
				ret = ret.slice(0, -1) + '(' + ELconv.ByteStringSeparater(edt) + ')';
			}
			// 4.プロパティマップ以外はJSON DBのEDT対応表を参照
			else if( contentRule.keyValues['0x' + edt] ) {
				ret = contentRule.keyValues['0x' + edt]  + '(' + ELconv.ByteStringSeparater(edt) + ')';
			}
		}
	}


	// その他，特殊な形
	// 分電盤メータリング 0287
	if( eoj.substr(0,4) == '0287' ) {
		switch( epc ) {
		  case 'C2':
			ret = ELconv.distributionBoardC2( eoj, epc, edt);
			break;
		  case 'B2':
		  case 'B4':
		  case 'B6':
		  case 'B9':
		  case 'BB':
		  case 'BD':
			ret = ELconv.distributionBoardB2B4B6B9BBBD( eoj, epc, edt);
			break;
		  case 'B3':
			ret = ELconv.distributionBoardB3( eoj, epc, edt);
			break;
		  case 'B5':
			ret = ELconv.distributionBoardB5( eoj, epc, edt);
			break;
		  case 'B7':
			ret = ELconv.distributionBoardB7( eoj, epc, edt);
			break;
		  case 'BA':
			ret = ELconv.distributionBoardBA( eoj, epc, edt);
			break;
		  case 'BC':
			ret = ELconv.distributionBoardBC( eoj, epc, edt);
			break;
		  case 'BE':
			ret = ELconv.distributionBoardBE( eoj, epc, edt);
			break;
		}
	}

	// 低圧スマート電力量メータ01(028801)
	if( eoj.substr(0,4) === '0288' ) {
		switch( epc ) {
		case 'E8':
			ret = ELconv.lowVoltageSmartElectricEnergyMeterE8( eoj, epc, edt );
			break;
		}
	}

	return ret;
};

// ESVのマッピング
ELconv.refESV = function(esv)  {
	let esv_dict = {
		"50":   'SETI_SNA',
		"51":  'SETC_SNA',
		"52":  'GET_SNA',
		"53":  'INF_SNA',
		"5e": 'SETGET_SNA',
		"60": 'SETI',
		"61": 'SETC',
		"62": 'GET',
		"63": 'INF_REQ',
		"6e": 'SETGET',
		"71": 'SET_RES',
		"72": 'GET_RES',
		"73": 'INF',
		"74": 'INFC',
		"7a": 'INFC_RES',
		"7e": 'SETGET_RES' };
	return  ( esv_dict[esv] );
};


// elsを解析する
ELconv.elsAnarysis = function( els, callback ) {

	// 初期化していなかったら初期化する
	if( !ELconv.m_initialized ) {
		ELconv.initialize();
	}

	let ret = { 'EHD': 'ECHONET Lite',
		'TID': '??',
		'SEOJ': '??',
		'DEOJ': '??',
		'ESV': '??',
		'OPC': '??',
		'EDT': {} };

	ret.TID = els.TID;
	ret.SEOJ = ELconv.refEOJ( els.SEOJ );
	ret.DEOJ = ELconv.refEOJ( els.DEOJ );
	ret.ESV = ELconv.refESV(els.ESV);
	ret.OPC = els.OPC;

	// EDT だけ少し面倒くさい
	Object.keys( els.DETAILs ).forEach( function (epc) { // epc
		let retEpc;
		switch( els.ESV  ) {
		  case '60': // SETIはDEOJを参照
		  case '61': // SETC
			retEpc = ELconv.refEPC( els.DEOJ, epc);
			ret['EDT'][retEpc] = ELconv.parseEDT( els.DEOJ, epc, els.DETAILs[epc] ); //edt
			break;

		  case '62': // GETはEDT=00
		  case '63': // INF_REQ
		  case '6e':
			retEpc = ELconv.refEPC( els.DEOJ, epc);
			ret['EDT'][retEpc] = 'Request(00)'; //edt
			break;

			// returnはSEOJを参照
		  case '50': // seti_sna
		  case '51': // setc_sna
		  case '52': // get_sna
		  case '53': // inf_sna
		  case '5e': // setget_sna
		  case '71': // set_res
		  case '72': // get_res
		  case '73': // inf
		  case '74': // infc
		  case '7a': // infc_res
		  case '7e': // setget_res
			retEpc = ELconv.refEPC( els.SEOJ, epc);
			ret['EDT'][retEpc] = ELconv.parseEDT( els.SEOJ, epc, els.DETAILs[epc] ); //edt
			break;

		  default:
			retEpc = ELconv.refEPC( els.DEOJ, epc);
			ret['EDT'][retEpc] = 'unknown(' + ELconv.ByteStringSeparater(els.DETAILs[epc]) + ')'; //edt
			break;
		}
	});

	callback( ret );
};


module.exports = ELconv;

//////////////////////////////////////////////////////////////////////
// EOF
//////////////////////////////////////////////////////////////////////
