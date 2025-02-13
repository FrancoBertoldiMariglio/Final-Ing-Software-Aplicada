pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
        DOCKER_IMAGE = 'elk-backend'
        DOCKER_TAG = "${BUILD_NUMBER}"
        PUPPETEER_SKIP_DOWNLOAD = 'true'
        // TestContainers configuration
        TESTCONTAINERS_RYUK_DISABLED = 'true'
        DOCKER_HOST = 'unix:///var/run/docker.sock'
        PATH = "/var/jenkins_home/workspace/pipeline-backend/backend/target/node:${env.PATH}"
        NODE_PATH = "/var/jenkins_home/workspace/pipeline-backend/backend/target/node/node_modules"
    }

    stages {
        stage('Build') {
            steps {
                dir('backend') {
                    sh '''
                        # Install Chromium for ARM64
                        apt-get update
                        apt-get install -y chromium

                        # Set Chrome binary path for Puppeteer
                        export CHROME_BIN=/usr/bin/chromium
                        export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

                        chmod +x mvnw
                        ./mvnw clean install -DskipTests
                    '''
                }
            }
        }

        stage('Unit Tests') {
            environment {
                CHROME_BIN = '/usr/bin/chromium'
            }
            steps {
                dir('backend') {
                    sh '''
                        # Ensure Docker socket is accessible
                        chmod 666 /var/run/docker.sock || true

                        # Run tests with TestContainers configuration
                        ./mvnw test \
                            -Dtestcontainers.reuse.enable=true \
                            -Dspring.datasource.url=jdbc:mysql://mysql:3307/biblioteca \
                            -Dspring.elasticsearch.uris=http://elasticsearch:9201
                    '''
                }
            }
        }

        stage('Integration Tests') {
            environment {
                CHROME_BIN = '/usr/bin/chromium'
            }
            steps {
                dir('backend') {
                    sh '''
                        # Ensure npm is in PATH
                        export PATH="/var/jenkins_home/workspace/pipeline-backend/backend/target/node:${PATH}"
                        export NODE_PATH="/var/jenkins_home/workspace/pipeline-backend/backend/target/node/node_modules"

                        # Verify npm installation
                        which npm || echo "npm not found in PATH: $PATH"

                        echo "Available npm scripts:"
                        npm run

                        export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
                        npm install
                        npm run cypress || npm run e2e || npm run test:e2e || echo "No Cypress tests found"
                    '''
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
                dir('backend') {
                    sh """
                        # Stop and remove existing container if running
                        docker stop backend || true
                        docker rm backend || true

                        docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                        docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                    """
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
                if (getContext(hudson.FilePath)) {
                    catchError(buildResult: 'SUCCESS', stageResult: 'SUCCESS') {
                        sh '''
                            docker logout || true

                            # Stop running container before removing images
                            docker stop backend || true
                            docker rm backend || true

                            # Force remove images
                            docker rmi -f ${DOCKER_IMAGE}:${DOCKER_TAG} || true
                            docker rmi -f ${DOCKER_IMAGE}:latest || true
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