pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
        DOCKER_IMAGE = 'francobertoldimariglio/backend'
        DOCKER_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Build') {
            steps {
                node {
                    dir('backend') {
                        sh '''
                            chmod +x mvnw
                            ./mvnw clean install
                        '''
                    }
                }
            }
        }

        stage('Verify Dependencies') {
            steps {
                node {
                    sh '''
                        echo "Verifying Elasticsearch connection..."
                        until curl -s http://elasticsearch:9200 > /dev/null; do
                            sleep 5
                            echo "Waiting for Elasticsearch..."
                        done
                        echo "Verifying MySQL connection..."
                        until mysqladmin ping -h mysql --silent; do
                            sleep 5
                            echo "Waiting for MySQL..."
                        done
                    '''
                }
            }
        }

        stage('Unit Tests') {
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

        stage('Integration Tests') {
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

        stage('Build Docker Image') {
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

        stage('Deploy to Docker Hub') {
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
            script {
                node {
                    if (getContext(hudson.FilePath)) {
                        sh '''
                            docker logout
                            docker rmi ${DOCKER_IMAGE}:${DOCKER_TAG} || true
                            docker rmi ${DOCKER_IMAGE}:latest || true
                        '''
                    }
                }
            }
        }
        success {
            echo '✅ Pipeline executed successfully'
        }
        failure {
            echo '❌ Pipeline failed'
        }
    }
}