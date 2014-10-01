sudo service neo4j-service stop
sleep 1
sudo rm -rf /var/lib/neo4j/data/
sudo mkdir /var/lib/neo4j/data/
sudo chown neo4j /var/lib/neo4j/data/
sleep 1
sudo service neo4j-service start
sleep 5
sudo service neo4j-service stop
echo Stopped
sleep 1
sudo service neo4j-service start
sleep 5
neo4j-shell < reset.cql
echo reset.
