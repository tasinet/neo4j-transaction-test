CREATE CONSTRAINT  ON (id:Id) ASSERT id.uuid IS UNIQUE;
MATCH (n) OPTIONAL MATCH (n)-[r]-() delete r,n;
CREATE (:Id{uuid:1,label:'root'});
