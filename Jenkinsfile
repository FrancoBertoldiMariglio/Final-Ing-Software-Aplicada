pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
        DOCKER_IMAGE = 'francobertoldimariglio/backend'
        DOCKER_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Verificar Dependencias') {
            steps {
                sh '''
                    echo "Verificando conexión con Elasticsearch..."
                    until curl -s http://elasticsearch:9200 > /dev/null; do
                        sleep 5
                        echo "Esperando a Elasticsearch..."
                    done

                    echo "Verificando conexión con MySQL..."
                    until mysqladmin ping -h mysql --silent; do
                        sleep 5
                        echo "Esperando a MySQL..."
                    done
                '''
            }
        }

        stage('Tests Unitarios') {
            steps {
                dir('backend') {
                    sh '''
                        chmod +x mvnw
                        ./mvnw clean test
                    '''
                }
            }
        }

        stage('Tests de Cypress') {
            steps {
                dir('backend') {
                    sh '''
                        npm install
                        npm run cypress:run
                    '''
                }
            }
        }

        stage('Construir Imagen Docker') {
            when {
                expression {
                    currentBuild.resultIsBetterOrEqualTo('SUCCESS')
                }
            }
            steps {
                dir('backend') {
                    sh """
                        docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                        docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                    """
                }
            }
        }

        stage('Publicar en Docker Hub') {
            when {
                expression {
                    currentBuild.resultIsBetterOrEqualTo('SUCCESS')
                }
            }
            steps {
                sh '''
                    echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin
                    docker push ${DOCKER_IMAGE}:${DOCKER_TAG}
                    docker push ${DOCKER_IMAGE}:latest
                '''
            }
        }
    }

    post {
        always {
            script {
                sh 'docker logout'
                sh """
                    docker rmi ${DOCKER_IMAGE}:${DOCKER_TAG} || true
                    docker rmi ${DOCKER_IMAGE}:latest || true
                """
            }
        }
        success {
            script {
                echo '✅ Pipeline ejecutado exitosamente'
            }
        }
        failure {
            script {
                echo '❌ El pipeline ha fallado'
            }
        }
    }
}

