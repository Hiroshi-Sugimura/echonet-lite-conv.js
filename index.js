//////////////////////////////////////////////////////////////////////
//	$Date:: 2016-04-03 17:56:33 +0900#$
//	$Rev: 9416 $
//	Copyright (C) Hiroshi SUGIMURA 2016.04.03 - above.
//////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////
const fs = require('fs');

// クラス変数
var ELconv = {
  m_dict: {},
  m_latestSpec: '1.12',
  m_latestAppendix:'I'
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
};


//////////////////////////////////////////////////////////////////////
// 変換系/内部関数
//////////////////////////////////////////////////////////////////////

// 1バイトを文字列の16進表現へ（1Byteは必ず2文字にする）
ELconv.toHexString = function( byte ) {
	// 文字列0をつなげて，後ろから2文字分スライスする
	return ( ('0' + byte.toString(16)).slice(-2) );
};


// 16進表現の文字列を数値のバイト配列へ
ELconv.toHexArray = function( string ) {
	var ret = [];
	var i, l, r;

	for( i=0; i < string.length; i += 2 ) {
		l = string.substr( i, 1 );
		r = string.substr( i+1, 1 );
		ret.push( (parseInt(l, 16) * 16) + parseInt(r, 16) );
	}

	return ret;
};

// contentType = customType
ELconv.YYMtoString = function( yym ) {  // Year(2byte), Month(1byte)
	var yy, m;
	yy = yym.substr( 0, 4 );
	m  = yym.substr( 4, 2 );
	return parseInt( yy, 16 ) + '.' + parseInt( m, 16);
};

ELconv.YYMDtoString = function( yymd ) { // Year(2byte), Month(1byte), Day(1byte)
	var yy, m, d;
	yy = yymd.substr( 0, 4 );
	m  = yymd.substr( 4, 2 );
	d  = yymd.substr( 6, 2 );
	return parseInt( yy, 16 ) + '.' + parseInt( m, 16) + '.' + parseInt( d, 16);
};

ELconv.HMtoString = function( hm ) {  // Hour(1byte), Minute(1byte)
	var h, m;
	h = hm.substr( 0, 2 );
	m = hm.substr( 2, 2 );
	return parseInt( h, 16 ) + '.' + parseInt( m, 16);
};

ELconv.HMStoString = function( hms ) { // Hour(1byte), Minute(1byte), Second(1byte)
	var h, m, s;
	h = hms.substr( 0, 2 );
	m = hms.substr( 2, 2 );
	s = hms.substr( 4, 2 );
	return parseInt( h, 16 ) + '.' + parseInt( m, 16) + '.' + parseInt( s, 16);
};

ELconv.HMFtoString = function( hmf ) { // Hour(1byte), Minute(1byte), Frame(1byte)
	var h, m, f;
	h = hms.substr( 0, 2 );
	m = hms.substr( 2, 2 );
	f = hms.substr( 4, 2 );
	return parseInt( h, 16 ) + '.' + parseInt( m, 16) + '.' + parseInt( f, 16);
};

ELconv.MStoString = function( ms ) {  // Minute(1byte), Second(1byte)
	var h, s;
	m = hms.substr( 0, 2 );
	s = hms.substr( 2, 2 );
	return parseInt( m, 16 ) + '.' + parseInt( s, 16);
};

// rawData
ELconv.HEXStringtoShiftJIS = function( hexString ) {
	var array = ELconv.toHexArray( hexString );

	return 'hoge';
};

ELconv.HEXStringtoASCII = function( hexString ) {
	var array = ELconv.toHexArray( hexString );
	return Buffer(array).toString('ASCII');
};



// EOJを文字列へ
ELconv.refEOJ = function(eoj) {
	var ret = eoj = eoj.toUpperCase();
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
	// console.log( '------------------------------' );
	// console.log( 'refEPC: ' + eoj + ':' + epc );
	eoj = eoj.toUpperCase();
	var ret = epc = epc.toUpperCase();

	// F0からFFまではuser defined
	upper = epc.substr( 0, 1 );
	if( upper == 'F' ) {
		ret = 'ユーザ定義領域(' + epc + ')';
	}

	// スーパークラスにあるか？
	if( undefined != ELconv.m_dictSup.elObjects['0x0000'].epcs['0x'+epc] ) { // 指定のEPCはあるか？あればまず確保，機器固有があれば上書き
		ret = ELconv.m_dictSup.elObjects['0x0000'].epcs['0x'+epc].epcName  + '(' + epc + ')';
	}

	if( eoj.substr(0, 4) == '0EF0' ) {  // node profile object
		var devProps = ELconv.m_dictNod.elObjects['0x'+eoj.substr(0, 4)];
		if( '0x'+epc in devProps.epcs ) { // 指定のEPCはあるか？
			ret = devProps.epcs['0x'+epc].epcName  + '(' + epc + ')';
		}
	}

	// 各機器固有のEPCか？
	if( ELconv.m_dictDev.elObjects['0x'+eoj.substr(0, 4)] ) {  // 指定のEOJはあるか？
		var devProps = ELconv.m_dictDev.elObjects['0x'+eoj.substr(0, 4)];
		if( '0x'+epc in devProps.epcs ) { // 指定のEPCはあるか？
			ret = devProps.epcs['0x'+epc].epcName  + '(' + epc + ')';
		}
	}
	return (ret);
};



//////////////////////////////////////////////////////////////////////
// 変換系
//////////////////////////////////////////////////////////////////////

// ネットワーク内のEL機器全体情報を更新する
ELconv.refer = function( facilities, callback ) {
	var ret = {'IPs':[]};

	Object.keys( facilities ).forEach( function (ip) { // ip
		ret.IPs.push(ip);
		ret[ip] = {'EOJs': []}
		Object.keys( facilities[ip] ).forEach( function (eoj) { // eoj
			retEoj = ELconv.refEOJ(eoj) + '(' + eoj + ')';
			ret[ip].EOJs.push( retEoj );
			ret[ip][retEoj] = { 'EPCs': [] };
			Object.keys( facilities[ip][eoj] ).forEach( function (epc) { // epc
				retEpc = ELconv.refEPC(eoj, epc);
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

	var contentRule;
	var ret;

	// F0からFFまではuser defined
	upper = epc.substr( 0, 1 );
	if( upper == 'F' ) {
		ret = 'ユーザ定義領域(' + edt + ')';
		return ret;
	}

	// スーパークラスにあるか？
	if( undefined != ELconv.m_dictSup.elObjects['0x0000'].epcs['0x'+epc] ) { // 指定のEPCはあるか？あればまず確保，機器固有があれば上書き
		contentRule = ELconv.m_dictSup.elObjects['0x0000'].epcs['0x'+epc].edt[0].content;
	}

	if( eoj.substr(0, 4) == '0EF0' ) {  // node profile object
		var devProps = ELconv.m_dictNod.elObjects['0x'+eoj.substr(0, 4)];
		if( '0x'+epc in devProps.epcs ) { // 指定のEPCはあるか？
			contentRule = ELconv.m_dictNod.elObjects['0x'+eoj.substr(0, 4)].epcs['0x'+epc].edt[0].content;
		}
	}

	// 各機器固有のEPCか？
	if( ELconv.m_dictDev.elObjects['0x'+eoj.substr(0, 4)] ) {  // 指定のEOJはあるか？
		var devProps = ELconv.m_dictDev.elObjects['0x'+eoj.substr(0, 4)];
		if( '0x'+epc in devProps.epcs ) { // 指定のEPCはあるか？
			contentRule = ELconv.m_dictDev.elObjects['0x'+eoj.substr(0, 4)].epcs['0x'+epc].edt[0].content;
		}
	}

	// 1.content typeをみてみる
	for (var contentType in contentRule) {
		switch (contentType){
		  case 'rawData':				// rawData
			switch (contentRule.rawData) {
			  case 'ASCII':
				ret = ELconv.HEXStringtoASCII(edt) + '(ascii:' + edt + ')';
				break;
			  case 'ShiftJIS':
			  case 'binary':
			  default:
				ret = contentRule.rawData + '(' + edt + ')';
				break;
			}
			break;

		  case 'numericValue':			// numericValue
			var val = 0;
			switch (contentRule.numericValue.integerType) {
			  case 'Signed':
				val = parseInt( edt, 16);  // signedにしたい
				if (val > 127) { val = val - 256 }
				break;
			  case 'Unsigned':
			  default:
				// エラー返すのどうしたらいいかわからん。
				val = parseInt( edt, 16);
				break;
			}

			var mag = 0; // 倍率を10のN乗表記した指数部。省略可。例: -1(x0.1), 2(x100)
			if( contentRule.numericValue.magnification ) {
				mag = parseInt(contentRule.numericValue.magnification);
			}

			var unit = ''; //  単位。省略可。例: '℃'
			if( contentRule.numericValue.unit ) {
				unit = contentRule.numericValue.unit;
			}

			ret = val * Math.pow(10, mag) + unit + '(' + edt + ')';
			break;

		  case 'level': // Rel.I, クッキングヒータクラスの加熱出力設定には非対応
			var val = parseInt( edt, 16);
			var min = parseInt( contentRule.level.min, 10);
			val -= min + 1;
			ret = 'level ' + val + '(' + edt + ')';
			break;

		  case 'customType':  // 時間
			switch( contentRule.customType ) {
			  case 'YYM':  // Year(2byte), Month(1byte)
				ret = ELconv.MStoString( edt ) + '(' + edt + ')';
				break;
			  case 'YYMD': // Year(2byte), Month(1byte), Day(1byte)
				ret = ELconv.YYMDtoString( edt ) + '(' + edt + ')';
				break;
			  case 'HM':   // Hour(1byte), Minute(1byte)
				ret = ELconv.HMtoString( edt ) + '(' + edt + ')';
				break;
			  case 'HMS':  // Hour(1byte), Minute(1byte), Second(1byte)
				ret = ELconv.HMStoString( edt ) + '(' + edt + ')';
				break;
			  case 'HMF':  // Hour(1byte), Minute(1byte), Frame(1byte)
				ret = ELconv.HMFtoString( edt ) + '(' + edt + ')';
				break;
			  case 'MS':   // Minute(1byte), Second(1byte)
				ret = ELconv.MStoString( edt ) + '(' + edt + ')';
				break;
			}
			break;

		  case 'bitmap': // 各EPC個別対応しかできないかも？
			ret = 'bitmap' + '(' + edt + ')';
			break;
		  case 'others': // 各EPC個別対応しかできないかも？
			ret = contentRule.others + '(' + edt + ')';
			break;
		  default:
			ret = contentType + '(' + edt + ')';
			break;
		}
	}

	// 2.keyValuesを持つときはそちらを優先するが，undefinedの時は値を更新しない
	for (var contentType in contentRule) {
		if( contentType == 'keyValues' ) {

			if( epc=='D6' ) {			// 3.keyValuesの特殊な形として，自ノードインスタンスリストSを解決する
				var count = parseInt( edt.substring( 0, 2) );
				ret = '';
				for( var i = 0; i<count; i++ ) {
					var st = edt.substr( i*6+2, 6);
					ret += ELconv.refEOJ(st) + ',';
				}
				ret = ret.slice(0, -1) + '(' + edt + ')';
			}
			else if( epc=='D7' ) { // 3.keyValuesの特殊な形として，自ノードクラスリストSを解決する
				var count = parseInt( edt.substring( 0, 2) );
				ret = '';
				for( var i = 0; i<count; i++ ) {
					var st = edt.substr( i*4+2, 4 );
					ret += ELconv.refEOJ(st) + ',';
				}
				ret = ret.slice(0, -1) + '(' + edt + ')';
			}
			// 4.プロパティマップ以外はJSON DBのEDT対応表を参照
			else if( contentRule.keyValues['0x' + edt] ) {
				ret = contentRule.keyValues['0x' + edt]  + '(' + edt + ')';
			}
		}
	}

	return ret;
};


module.exports = ELconv;

//////////////////////////////////////////////////////////////////////
// EOF
//////////////////////////////////////////////////////////////////////
