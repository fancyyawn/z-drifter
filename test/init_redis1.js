const request = require('request');

for(let i = 1; i<=5; ++i){
    request.post({
        url: 'http://localhost:3002',
        json: {
            owner: 'zhang'+i,
            type: 'male',
            content: 'content'+i
        }
    });
}
