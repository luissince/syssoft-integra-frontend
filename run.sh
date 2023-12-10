docker stop sysintegra-frontend && docker rm sysintegra-frontend

docker image rm sysintegra-frontend-image

docker build -t sysintegra-frontend-image .

docker run -d \
--restart always \
--name sysintegra-frontend \
--net=luis \
-p 6000:80 \
sysintegra-frontend-image