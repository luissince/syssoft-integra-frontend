
function success(res, result) {
    res.status(200).send(result);
}

function error(res, result) {
    res.status(500).send(result);
}

function response(res, result) {
    if (typeof result === 'object') {
        res.status(200).send(result);
    } else if (result === "insert") {
        res.status(200).send(result);
    } else if (result === "update") {
        res.status(200).send(result);
    } else {
        res.status(500).send(result);
    }
}

module.exports = { success, error, response };