
const httpntlm = require('httpntlm');
var ntlm = httpntlm.ntlm;
var url = require('url');
var httpreq = require('httpreq');

var _ = require('underscore');
var http = require('http');
var https = require('https');



exports.soap = function(url, urn, credentials, params, finalCallback){
    if(!credentials.workstation) credentials.workstation = '';
	if(!credentials.domain) credentials.domain = '';
    
    
    let paramsXML = "";
    for ( k of Object.keys(params) ){
        let p = params[k];
        
        let str = `<${k}>${p}</${k}>`;
        paramsXML += ` ${str} `;
    }
    
    credentials.body = `<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"> \
<Body> \
    <Read xmlns="${urn}"> \
        ${paramsXML} \
    </Read> \
</Body> \
</Envelope> `;
    
    var httpreqOptions = _.omit(credentials, 'url', 'username', 'password', 'workstation', 'domain');
    
    // is https?
	var isHttps = false;
	var reqUrl = url; //url.parse(credentials.url);
	if(reqUrl.protocol == 'https:') isHttps = true;

	// set keepaliveAgent (http or https):
	var keepaliveAgent;

	if(isHttps){
		keepaliveAgent = new https.Agent({keepAlive: true});
	}else{
		keepaliveAgent = new http.Agent({keepAlive: true});
	}
	
    sendType1Message(credentials, function (err, res) {
		if(err) return finalCallback(err);
		setImmediate(function () { // doesn't work without setImmediate()
			sendType3Message(res, credentials, finalCallback);
		});
	});
	



function sendType1Message (credentials, callback) {
		var type1msg = ntlm.createType1Message(credentials);

		var type1options = {
			headers:{
				'Connection' : 'keep-alive',
				'Authorization': type1msg,
                'Content-Type': 'application/xml; charset=utf-8',
                'SOAPAction': '"urn:microsoft-dynamics-schemas/page/wsemployees:Read"'
			},
			timeout: credentials.timeout || 0,
			agent: keepaliveAgent,
			allowRedirects: false // don't redirect in httpreq, because http could change to https which means we need to change the keepaliveAgent
		};

		// pass along other options:
		type1options = _.extend({}, _.omit(httpreqOptions, 'headers', 'body'), type1options);

		// send type1 message to server:
		httpreq['post'](credentials.url, type1options, callback);
	}

	function sendType3Message (res, credentials, callback) {
		// catch redirect here:
		if(res.headers.location) {
			credentials.url = res.headers.location;
			return exports['post'](credentials, finalCallback);
		}


		if(!res.headers['www-authenticate'])
			return callback(new Error('www-authenticate not found on response of second request'));

		// parse type2 message from server:
		var type2msg = ntlm.parseType2Message(res.headers['www-authenticate'], callback); //callback only happens on errors
		if(!type2msg) return; // if callback returned an error, the parse-function returns with null

		// create type3 message:
		var type3msg = ntlm.createType3Message(type2msg, credentials);

		// build type3 request:
		var type3options = {
			headers: {
				'Connection': 'Close',
				'Authorization': type3msg,
                'Content-Type': 'application/xml; charset=utf-8',
                'SOAPAction': '"urn:microsoft-dynamics-schemas/page/wsemployees:Read"'
			},
			allowRedirects: false,
			agent: keepaliveAgent
		};

		// pass along other options:
		type3options.headers = _.extend(type3options.headers, httpreqOptions.headers);
		type3options = _.extend(type3options, _.omit(httpreqOptions, 'headers'));

		// send type3 message to server:
		httpreq['post'](credentials.url, type3options, callback);
	}

/*
	sendType1Message(credentials, function (err, res) {
		if(err) return finalCallback(err);
		setImmediate(function () { // doesn't work without setImmediate()
			sendType3Message(res, finalCallback);
		});
	});
*/

}


async function soapcall(auth){

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'SOAPAction': '"urn:microsoft-dynamics-schemas/page/wsemployees:Read"',
            'Authorization': auth,
            'Connection' : 'keep-alive',
        },
        body: body,
    };
    
    console.log("");
    console.log("");
    console.log(" >> ", auth);
    

    //console.log(options.headers);
    
    
    
        const response = await fetch(url, options)

        console.log(" << ",response.headers.get('www-authenticate'));
        
        console.log(response.status, response.statusText);
        

        return response;
    
}



