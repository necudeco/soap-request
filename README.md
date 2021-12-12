This is a small library  maked for resolve issue connection with a project.

It was not development as a multiporpouse library, but it could be.

For use:

 const soap = require('soap-request');

 const credentials = {
        url: 'http://....',
        username: 'anyusername',
        password: 'anypassword',
        domain: '',
        workstation: ''
    };
    
    const params = {
        'No':'EMPL000014'
    };
    
    
  soap.soap(url, urn, credentials, params,  function(err, res){
      if ( err ) console.log(err);
            
       console.log(res.body);
    
  });
    
}


