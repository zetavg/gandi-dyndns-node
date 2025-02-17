const request = require('request');
const rp = require('request-promise');

const update = function(domainName, name, type, apiKey) {

    const options = {
        uri: 'https://dns.api.gandi.net/api/v5/domains/' + domainName + '/records/' + name + '/' + type,
        headers: {
            'X-Api-Key': apiKey
        },
        json: true
    };

    rp(options)

        .then(function(response) {
            // Getting the old IP address
            return response.rrset_values[0];
        })
        .then(function(oldIPAddress) {

            // Getting actual external IP address
            rp('http://me.gandi.net')
                .then(function(externalIPAddress) {

                    // Removing some carriege return unwanted from external ip address provideo by gandi service
                    externalIPAddress = externalIPAddress.toString().replace('\n','');

                    if (externalIPAddress !== oldIPAddress) {
                        console.log(new Date() + ' | For domain : ' + domainName + ' | Ext IP : ' + externalIPAddress + ' | Gandi IP : ' + oldIPAddress + ' --> changing');

                        const optionsToChange = {
                            method: 'PUT',
                            uri: 'https://dns.api.gandi.net/api/v5/domains/' + domainName + '/records/' + name + '/' + type,
                            headers: {
                                'X-Api-Key': apiKey
                            },
                            body: {
                                "rrset_values":[externalIPAddress],
                                "rrset_ttl": 300
                            },
                            json: true
                        };

                        rp(optionsToChange)
                            .then(function(response) {
                                console.log(new Date() + ' | ' + response.message);
                            })
                            .catch(function(error) {
                                console.log(new Date() + ' | ' + error);
                            })

                    } else {
                        console.log(new Date() + ' | External IP and Gandi IP for domain : ' + domainName + ' are the same - not changing anything');
                    }
                })
                .catch(function(error) {
                    console.log(new Date() + ' | ' + error);
                })
        })

        .catch(function(error) {
            console.log(new Date() + ' | ' + error);
        });
};

exports.update = update;

