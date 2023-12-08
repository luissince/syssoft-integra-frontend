docker stop sysintegra-front-end && docker rm sysintegra-front-end

docker image rm sysintegra-front-end

docker build -t sysintegra-front-end .

docker run -d \
--restart always \
--name sysintegra-front-end \
--net=luis \
-p 6000:80 \
sysintegra-front-end