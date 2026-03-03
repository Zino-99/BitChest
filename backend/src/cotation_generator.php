<?php

/**

* Returns the market value of the cryptocurrency

* @param $cryptoname {string} The name of the cryptocurrency

*/
function getFirstCotation($cryptoname){
  return ord(substr($cryptoname,0,1)) + rand(0, 10);
}

/**

* Returns the daily price change of the cryptocurrency

* @param $cryptoname {string} The name of the cryptocurrency

*/
function getCotationFor($cryptoname){	
	return ((rand(0, 99)>40) ? 1 : -1) * ((rand(0, 99)>49) ? ord(substr($cryptoname,0,1)) : ord(substr($cryptoname,-1))) * (rand(1,10) * .01);
}