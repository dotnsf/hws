//. mltest.js
var reader = require( 'readline' ).createInterface({
  input: process.stdin,
  output: process.stdout
});
var XLSX = require( 'xlsx' );
var Utils = XLSX.utils;

var book = XLSX.readFile( 'xls/data.xls' );

for( sheetname in book.Sheets ){
  var sheet = book.Sheets[sheetname];
  var range = sheet["!ref"];

  var decodeRange = Utils.decode_range( range );
  //console.log( decodeRange );  //. { s: { c: 0, r: 0 }, e: { c: 8, r: 990 } }

  var heights = [], weights = [], shoeses = [], genders = [];
  for( var r = 1; r <= decodeRange.e.r; r ++ ){
    var height_address = Utils.encode_cell( { r: r, c: 1 } );
    var height_cell = sheet[height_address];
    var height = height_cell.v;
    heights.push( height );

    var weight_address = Utils.encode_cell( { r: r, c: 2 } );
    var weight_cell = sheet[weight_address];
    var weight = weight_cell.v;
    weights.push( weight );

    var shoes_address = Utils.encode_cell( { r: r, c: 3 } );
    var shoes_cell = sheet[shoes_address];
    var shoes = shoes_cell.v;
    shoeses.push( shoes );

    var gender_address = Utils.encode_cell( { r: r, c: 4 } );
    var gender_cell = sheet[gender_address];
    var gender = gender_cell.v;
    genders.push( gender );
  }

  //console.log( heights );
  //console.log( weights );
  //console.log( shoeses );
  //console.log( genders );

  var min_distance = 100 * 100;
  var min_i = -1, min_j = -1;
  for( var i = -10; i <= 10; i ++ ){
    if( i != 0 ){
      for( var j = 0; j <= 200; j ++ ){
        //. y = ix + j  ->  ax + by + c = 0
        var a = i;
        var b = -1;
        var c = j;

        //. Y軸との接点をA(0,A), X軸との接点をB(B,0)とする
        var A = j;
        var B = -1 * i / j;

        //. distance( ax + by + c = 0, (x0, y0) ) = |ax0 + by0 + c| / sqrt( a^2 + b^2 )
        var rt = Math.sqrt( a * a + b * b );
        var sum_d = 0;
        for( var idx = 0; idx < heights.length; idx ++ ){
          //. http://akihiro.s56.xrea.com/mt/archives/000036.html
          //. 男の点は線分ABの進行方向左側、女の点は線分ABの進行方向右側にある想定
          var p = ( B - 0 ) * ( weights[idx] - A ) - ( 0 - A ) * ( heights[idx] - 0 );
          if( ( p > 0 && genders[idx] == '女' ) || ( p < 0 && genders[idx] == '男' ) ){

            //. 直線との位置関係が想定外だった場合のみ加算
            var d = Math.abs( a * weights[idx] + b * heights[idx] + c ) / rt;
            sum_d += d;
          }
        }

        if( sum_d < min_distance ){
          min_i = i;
          min_j = j;
          min_distance = sum_d;
        }
      }
    }
  }

  //console.log( 'min_i = ' + min_i + ', min_j = ' + min_j );
  console.log( '  ->  y = ' + min_i + ' * x + ' + min_j );

  reader.question( "(weight,height)?", function( answer ){
    var tmp = answer.split(',');
    if( tmp && tmp.length > 1 ){
      var A = min_j;
      var B = -1 * min_i / min_j;
      var w = parseFloat( tmp[0] );
      var h = parseFloat( tmp[1] );
      var p = ( B - 0 ) * ( w - A ) - ( 0 - A ) * ( h - 0 );
      if( p > 0 ){
        console.log( '  ->  男' );
      }else{
        console.log( '  ->  女' );
      }
    }else{
      console.log( '-> not understandable.' );
    }

    reader.close();
  });
}
