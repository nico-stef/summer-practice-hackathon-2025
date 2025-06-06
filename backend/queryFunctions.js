const connection = require("./database");
const jwt = require('jsonwebtoken');

const queryAsync = (query, values) => {
    return new Promise((resolve, reject) => {
        connection.query(query, values, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

module.exports = {
    queryAsync
};