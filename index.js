//////////////////////////////////////////////////////////////////////
//	$Date:: 2016-04-03 17:56:33 +0900#$
//	$Rev: 9416 $
//	Copyright (C) Hiroshi SUGIMURA 2016.04.03 - above.
//////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////
const fs = require('fs');

// クラス変数
var ELconv = {
  m_dict: {}
};


// 辞書の読み込み
ELconv.initialize = function () {
	ELconv.m_dictNod = JSON.parse( fs.readFileSync('./node_modules/echonet-lite-conv/nodeProfile.json', 'utf8') );
	ELconv.m_dictSup = JSON.parse( fs.readFileSync('./node_modules/echonet-lite-conv/superClass.json', 'utf8') );
	ELconv.m_dictDev = JSON.parse( fs.readFileSync('./node_modules/echonet-lite-conv/deviceObject_G.json', 'utf8') );
};


//////////////////////////////////////////////////////////////////////
// 変換系/内部関数
//////////////////////////////////////////////////////////////////////

// 1バイトを文字列の16進表現へ（1Byteは必ず2文字にする）
ELconv.toHexString = function( byte ) {
	// 文字列0をつなげて，後ろから2文字分スライスする
	return ( ("0" + byte.toString(16)).slice(-2) );
};


// 16進表現の文字列を数値のバイト配列へ
ELconv.toHexArray = function( string ) {
	var ret = [];

	for( i=0; i < string.length; i += 2 ) {

		l = string.substr( i, 1 );
		r = string.substr( i+1, 1 );

		ret.push( (parseInt(l, 16) * 16) + parseInt(r, 16) );
	}

	return ret;
};


// EOJを文字列へ
ELconv.refEOJ = function(eoj) {
	var ret = eoj = eoj.toUpperCase();
	if( eoj.substr(0,4) == '0EF0' ) {
		ret = ELconv.m_dictNod.elObjects["0x0EF0"].objectName + eoj.substr(4,2)  + "(" + eoj + ")";
	}
	if( ELconv.m_dictDev.elObjects["0x"+eoj.substr(0,4)] ) {
		ret = ELconv.m_dictDev.elObjects["0x"+eoj.substr(0,4)].objectName + eoj.substr(4,2)  + "(" + eoj + ")";
	}
	return ret;
};

// EPCを文字列へ
ELconv.refEPC = function(eoj, epc) {
	// console.log( "------------------------------" );
	// console.log( "refEPC: " + eoj + ":" + epc );
	eoj = eoj.toUpperCase();
	var ret = epc = epc.toUpperCase();

	// スーパークラスにあるか？
	if( undefined != ELconv.m_dictSup.elObjects["0x0000"].epcs["0x"+epc] ) { // 指定のEPCはあるか？あればまず確保，機器固有があれば上書き
		ret = ELconv.m_dictSup.elObjects["0x0000"].epcs["0x"+epc].epcName  + "(" + epc + ")";
	}

	if( eoj.substr(0, 4) == '0EF0' ) {  // node profile object
		var devProps = ELconv.m_dictNod.elObjects["0x"+eoj.substr(0, 4)];
		if( "0x"+epc in devProps.epcs ) { // 指定のEPCはあるか？
			ret = devProps.epcs["0x"+epc].epcName  + "(" + epc + ")";
		}
	}

	// 各機器固有のEPCか？
	if( ELconv.m_dictDev.elObjects["0x"+eoj.substr(0, 4)] ) {  // 指定のEOJはあるか？
		var devProps = ELconv.m_dictDev.elObjects["0x"+eoj.substr(0, 4)];
		if( "0x"+epc in devProps.epcs ) { // 指定のEPCはあるか？
			ret = devProps.epcs["0x"+epc].epcName  + "(" + epc + ")";
		}
	}
	return (ret);
};



//////////////////////////////////////////////////////////////////////
// 変換系
//////////////////////////////////////////////////////////////////////

// ネットワーク内のEL機器全体情報を更新する
ELconv.refer = function( facilities, callback ) {
	var ret = {"IPs":[]};

	Object.keys( facilities ).forEach( function (ip) { // ip
		ret.IPs.push(ip);
		ret[ip] = {"EOJs": []}
		Object.keys( facilities[ip] ).forEach( function (eoj) { // eoj
			retEoj = ELconv.refEOJ(eoj);
			ret[ip].EOJs.push( retEoj );
			ret[ip][retEoj] = { 'EPCs': [] };
			Object.keys( facilities[ip][eoj] ).forEach( function (epc) { // epc
				retEpc = ELconv.refEPC(eoj, epc);
				ret[ip][retEoj].EPCs.push(retEpc);
				ret[ip][retEoj][retEpc] = facilities[ip][eoj][epc];
			});
		}); // eoj
	}); // ip
	callback( ret );
};


module.exports = ELconv;

//////////////////////////////////////////////////////////////////////
// EOF
//////////////////////////////////////////////////////////////////////
