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
	ELconv.m_dict = JSON.parse( fs.readFileSync('./node_modules/echonet-lite-conv/dictionary_c.json', 'utf8') );
};


//////////////////////////////////////////////////////////////////////
// 変換系/内部関数
//////////////////////////////////////////////////////////////////////
// 1バイト文字をHEX数値にしたい，基本機能であるかもしれない．
ELconv.charToInteger = function( chara ) {
	var ret = 0;
	switch (chara) {
	case "0": case "1": case "2": case "3": case "4": case "5": case "6": case "7": case "8": case "9":
		ret = parseInt(chara);
		break;
	case "a": case "A":
		ret = 10;
		break;

	case "b": case "B":
		ret = 11;
		break;

	case "c": case "C":
		ret = 12;
		break;

	case "d": case "D":
		ret = 13;
		break;

	case "e": case "E":
		ret = 14;
		break;

	case "f": case "F":
		ret = 15;
		break;

	default : ret = 0; break;
	}
	return ret;
}

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

		ret.push( (ELconv.charToInteger(l) * 16) + ELconv.charToInteger(r) );
	}

	return ret;
};


// EOJを文字列へ
ELconv.refEOJ = function(eoj) {
	var ret = eoj;
	if( eoj.substr(0, 4) in ELconv.m_dict ) {
		ret = ELconv.m_dict[eoj.substr(0, 4)].name + eoj.substr(4,2);
	}
	return ret;
};

// EPCを文字列へ
ELconv.refEPC = function(eoj, epc) {
	// console.log( "------------------------------" );
	// console.log( "refEPC: " + eoj + ":" + epc );
	var ret = epc;


	if( eoj.substr(0, 4) == '0ef0' ) {  // node profile object
		if( epc in ELconv.m_dict["nodeSuper"] ) { // 指定のEPCはあるか？あればまず確保，機器固有があれば上書き
			ret = ELconv.m_dict["nodeSuper"][epc].name;
		}
	} else {  // device object
		// スーパークラスにあるか？
		if( epc in ELconv.m_dict["devSuper"] ) { // 指定のEPCはあるか？あればまず確保，機器固有があれば上書き
			ret = ELconv.m_dict["devSuper"][epc].name;
		}
	}

	// 各機器固有のEPCか？
	if( eoj.substr(0, 4) in ELconv.m_dict ) {  // 指定のEOJはあるか？
		var devProps = ELconv.m_dict[eoj.substr(0, 4)];
		if( epc in devProps ) { // 指定のEPCはあるか？
			ret = devProps[epc].name;
		}
	}
	return ret;
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
