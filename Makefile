# This is extracting all the queries from logs file
# quick-n-dirty not very reliable atm but does the job

LOGS_DIR=/var/log/nginx/
COMPILED_LOGS_FILE=logs
COMPILED_QUERIES=queries

all: cleanall regroup getqueries cleanqueries

regroup:
	@cat $(LOGS_DIR)maps_api_proxy_maps.ox.ac.uk.access.log.1 $(LOGS_DIR)maps_api_proxy_maps.ox.ac.uk.access.log > compiled
	@gunzip -c $(LOGS_DIR)maps_api_proxy_maps.ox.ac.uk.access.log.5.gz $(LOGS_DIR)maps_api_proxy_maps.ox.ac.uk.access.log.4.gz $(LOGS_DIR)maps_api_proxy_maps.ox.ac.uk.access.log.3.gz $(LOGS_DIR)maps_api_proxy_maps.ox.ac.uk.access.log.2.gz > gzip
	@cat gzip compiled > $(COMPILED_LOGS_FILE)
	@rm gzip
	@rm compiled

getqueries:
	@cat $(COMPILED_LOGS_FILE) | cut -d' ' -f7 | sort | uniq -c | grep "search?q=" | cut -d'&' -f1 | cut -d'=' -f2 | sort | uniq -c > $(COMPILED_QUERIES)

cleanqueries:
	@sed -i 's/%20/ /g' $(COMPILED_QUERIES)
	@sed -i "s/%27/'/g" $(COMPILED_QUERIES)
	@sed -i "s/%2C/,/g" $(COMPILED_QUERIES)
	@sed -i "s/%3D/=/g" $(COMPILED_QUERIES)
	@sed -i "s/%3F/?/g" $(COMPILED_QUERIES)
	@sed -i "s/%26/&/g" $(COMPILED_QUERIES)

cleanall:
	@rm -f $(COMPILED_QUERIES)
	@rm -f $(COMPILED_LOGS_FILE)

