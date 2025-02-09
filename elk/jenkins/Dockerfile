FROM jenkins/jenkins:lts-jdk17

USER root

# Instalar dependencias
RUN apt-get update && \
    apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common

# Descargar e instalar Filebeat
RUN curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-7.14.0-amd64.deb && \
    dpkg -i filebeat-7.14.0-amd64.deb

# Copiar configuración de Filebeat
COPY filebeat.yml /etc/filebeat/filebeat.yml

# Instalar Docker
RUN curl -fsSL https://get.docker.com -o get-docker.sh && \
    sh get-docker.sh

# Instalar Maven
RUN apt-get install -y maven

# Dar permisos a Jenkins para ejecutar Docker
RUN usermod -aG docker jenkins

# Configurar entrada de punto
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER jenkins

# Instalar plugins necesarios
RUN jenkins-plugin-cli --plugins \
    git \
    workflow-aggregator \
    docker-workflow \
    credentials-binding \
    pipeline-utility-steps

USER root
ENTRYPOINT ["/entrypoint.sh"]