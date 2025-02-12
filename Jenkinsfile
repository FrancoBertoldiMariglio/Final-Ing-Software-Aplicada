pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
        DOCKER_IMAGE = 'tu-usuario-dockerhub/tu-proyecto-backend'
        DOCKER_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Verificar Dependencias') {
            steps {
                node {
                    // Esperar a que elasticsearch y mysql estén disponibles
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
        }

        stage('Tests Unitarios') {
            steps {
                node {
                    dir('backend') {
                        sh '''
                            chmod +x mvnw
                            ./mvnw clean test
                        '''
                    }
                }
            }
        }

        stage('Tests de Cypress') {
            steps {
                node {
                    dir('backend') {
                        sh '''
                            npm install
                            npm run cypress:run
                        '''
                    }
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
                node {
                    dir('backend') {
                        sh """
                            docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                            docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                        """
                    }
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
                node {
                    sh '''
                        echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin
                        docker push ${DOCKER_IMAGE}:${DOCKER_TAG}
                        docker push ${DOCKER_IMAGE}:latest
                    '''
                }
            }
        }
    }

    post {
        always {
            node {
                sh 'docker logout'
                // Limpieza de imágenes
                sh """
                    docker rmi ${DOCKER_IMAGE}:${DOCKER_TAG} || true
                    docker rmi ${DOCKER_IMAGE}:latest || true
                """
            }
        }
        success {
            node {
                echo 'Pipeline ejecutado exitosamente'
            }
        }
        failure {
            node {
                echo 'El pipeline ha fallado'
            }
        }
    }
}
