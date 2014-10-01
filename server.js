var http = require('http'),
    fs = require('fs'),
    neo4j = require('neo4j'),
    db = new neo4j.GraphDatabase('http://localhost:7474'),
    log;

log = http.IncomingMessage.prototype.log = function () {
    var args = [
            this && this.id || '*',
            +new Date(),
        ].concat(Array.prototype.slice.apply(arguments));
    console.log.apply(console, args);
}

function createId(req,res,tries) {
    tries = tries || 0;
    db.query(
        'MATCH (i:Id) WITH i ORDER BY i.uuid DESC LIMIT 1 CREATE (n:Id {params}) SET n.uuid = i.uuid+1,  n.prev_label = i.label, n.prev_uuid = i.uuid, n.prev_nodeid = id(i), n.this_nodeid = id(n) RETURN n',
         { params: { label: 'Test' } },
         function(err,dat) {
            if (err) { //...err(or)
                if (err.message.search("already exists with label Id") > -1) {
                    //retry
                    req.log('(retry) ('+tries+')',err.message);
                    //recursion
                    return createId(req,res,++tries);
                } else {
                    req.log('(ERROR)',err);
                    throw new Error(err);
                }
            } else { //success
                var data = dat[0].n._data.data,
                    data_json = JSON.stringify(data);
                if (!data.uuid) {
                    req.log('ERROR - EMPTY UUID',data_json);
                    res.end('Received empty .uuid: '+data_json);
                    fs.writeFileSync('./empty_uuid.json',data_json);
                    throw new Error("Empty UUID received",data_json);
                }
                req.log('->',data.uuid,data.this_nodeid);
                res.end(data_json);
            }
        }
    );
}

var last_req_id = 0;
//test
db.query("RETURN 1 as ok",function(err,data){
        debugger;
    if (err || !(data && data[0].ok)) {
        throw new Error("neo4j expected at localhost:7474. "+(err && err.message));
    }
});
http.createServer(function (req, res) {
    req.id = ++last_req_id;
    if (req.method !== "GET") {
        return res.end("Only GET supported");
    }
    req.log('GET');
    createId(req,res);
}).listen(9339, '127.0.0.1');

log("Listening on 9339");
console.log("Req Id | Datetime | -> $uuid $nodeid")
