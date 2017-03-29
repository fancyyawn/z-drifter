const request = require('request');

for(let i = 1; i<=6; ++i){
    request.post({
        url: 'http://localhost:3002',
        json: {
            owner: 'cai'+i,
            type: 'female',
            content: 'content'+i
        }
    });
}