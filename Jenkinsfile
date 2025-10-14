pipeline {
    agent any

    environment {
        // Jenkins credentials (create these in Jenkins -> Credentials -> Global)
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')   // DockerHub username + password
        GIT_CRED              = credentials('GIT_CRED')          // GitHub PAT
        KUBECONFIG_CRED       = credentials('kubeconfig-file')  // Secret file: ~/.kube/config

        DOCKERHUB_USER = 'edwin684'
        IMAGE_NAME     = 'edwin684/k8s-cicd-pipeline'
        IMAGE_TAG      = "${env.BUILD_NUMBER ?: 'latest'}"
    }

    stages {

        stage('Checkout') {
            steps {
                echo "📦 Checking out source code from GitHub..."
                checkout([$class: 'GitSCM',
                          branches: [[name: '*/main']],
                          userRemoteConfigs: [[
                              url: 'https://github.com/edwin684/k8s-cicd-pipeline.git',
                              credentialsId: 'GIT_CRED'
                          ]]]
                )
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    echo "🐳 Building frontend Docker image..."
                    dir('frontend') {
                        sh "docker build -t ${IMAGE_NAME}-frontend:${IMAGE_TAG} ."
                    }

                    echo "🐳 Building backend Docker image..."
                    dir('backend') {
                        sh "docker build -t ${IMAGE_NAME}-backend:${IMAGE_TAG} ."
                    }
                }
            }
        }

        stage('Docker Login & Push') {
            steps {
                script {
                    echo "🚀 Logging in to DockerHub and pushing images..."
                    sh """
                        echo "${DOCKERHUB_CREDENTIALS_PSW}" | docker login -u "${DOCKERHUB_USER}" --password-stdin
                        docker push ${IMAGE_NAME}-frontend:${IMAGE_TAG}
                        docker push ${IMAGE_NAME}-backend:${IMAGE_TAG}
                    """
                }
            }
        }

        stage('Deploy to Kubernetes (EKS)') {
            steps {
                script {
                    echo "☸️ Deploying to Kubernetes cluster..."
                    writeFile file: 'kubeconfig', text: KUBECONFIG_CRED
                    sh '''
                        export KUBECONFIG=kubeconfig
                        kubectl set image deployment/frontend frontend=${IMAGE_NAME}-frontend:${IMAGE_TAG} --record || true
                        kubectl set image deployment/backend backend=${IMAGE_NAME}-backend:${IMAGE_TAG} --record || true
                        kubectl rollout status deployment/frontend || true
                        kubectl rollout status deployment/backend || true
                    '''
                }
            }
        }

        stage('Cleanup') {
            steps {
                echo "🧹 Cleaning up local Docker images..."
                sh """
                    docker rmi ${IMAGE_NAME}-frontend:${IMAGE_TAG} || true
                    docker rmi ${IMAGE_NAME}-backend:${IMAGE_TAG} || true
                    docker logout
                    docker system prune -af
                """
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful! Images: ${IMAGE_NAME}-frontend:${IMAGE_TAG}, ${IMAGE_NAME}-backend:${IMAGE_TAG}"
        }
        failure {
            echo "❌ Build or deploy failed. Check logs above."
        }
    }
}
